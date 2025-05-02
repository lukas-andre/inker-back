import { Injectable } from '@nestjs/common';
import { Point } from 'geojson';
import stringify from 'fast-safe-stringify';

import {
    BaseUseCase,
    UseCase,
} from '../../global/domain/usecases/base.usecase';
import { ArtistRepository } from '../../artists/infrastructure/repositories/artist.repository';
import { QuotationRepository } from '../infrastructure/repositories/quotation.provider';
import { ListOpenQuotationsQueryDto, GetOpenQuotationsResDto } from '../infrastructure/dtos/listOpenQuotationsQuery.dto';
import { QuotationStatus, QuotationType } from '../infrastructure/entities/quotation.entity';
import { OpenQuotationListItemDto } from '../domain/dtos/openQuotationListItem.dto';
import { OpenQuotationOfferDto } from '../domain/dtos/openQuotationOffer.dto';
import { ArtistLocationRepository } from '../../locations/infrastructure/database/artistLocation.repository'; // Assuming location repo exists
import { QuotationOfferRepository } from '../infrastructure/repositories/quotationOffer.repository';
import { In } from 'typeorm';

@Injectable()
export class ListOpenQuotationsUseCase extends BaseUseCase implements UseCase {
    constructor(
        private readonly quotationRepo: QuotationRepository,
        private readonly artistLocationRepo: ArtistLocationRepository,
        private readonly quotationOfferRepo: QuotationOfferRepository,
        private readonly artistRepo: ArtistRepository,
    ) {
        super(ListOpenQuotationsUseCase.name);
    }

    async execute(
        artistId: string,
        queryDto: ListOpenQuotationsQueryDto,
    ): Promise<GetOpenQuotationsResDto> {
        const { maxDistance } = queryDto;

        // 1. Get Artist's primary location (assuming first active location)
        const artistLocation = await this.artistLocationRepo.findOne({
            where: { artistId, isActive: true, locationOrder: 1 }, // Define criteria for primary location
        });

        if (!artistLocation || !artistLocation.location) {
            this.logger.warn(`Artist ${artistId} has no primary location set.`);
            // Decide behavior: throw error or return empty list?
            // throw new DomainNotFound('Artist primary location not found.');
            return { quotations: [] }; // Return empty for now
        }

        const artistPoint: Point = artistLocation.location;
        const artistPointGeoJsonString = stringify(artistPoint); // For PostGIS functions

        // 2. Build Query using QueryBuilder from the injected repository
        const queryBuilder = this.quotationRepo.repo.createQueryBuilder('q'); // Use .repo

        queryBuilder
            .select([
                'q.id as id',
                'q.customerId as customerId',
                'q.description as description',
                'q.referenceImages as referenceImages',
                'q.status as status',
                'q.type as type',
                'q.customerLat as customerLat',
                'q.customerLon as customerLon',
                'q.customerTravelRadiusKm as customerTravelRadiusKm',
                'q.createdAt as createdAt',
                // Calculate distance using PostGIS
                // Ensure quotation table has customerLat/customerLon indexed or consider a spatial index if performance is critical
                `ST_Distance(
                    ST_MakePoint(q.customerLon, q.customerLat)::geography, -- Customer location
                    ST_SetSRID(ST_GeomFromGeoJSON(:artistPoint), 4326)::geography -- Artist location
                ) / 1000 AS "distanceToArtistKm"`, // Convert meters to KM
            ])
            .where('q.status = :status', { status: QuotationStatus.OPEN })
            .andWhere('q.type = :type', { type: QuotationType.OPEN })
            // Filter 1: Distance between artist and customer <= customerTravelRadiusKm
            .andWhere(`ST_Distance(
                        ST_MakePoint(q.customerLon, q.customerLat)::geography,
                        ST_SetSRID(ST_GeomFromGeoJSON(:artistPoint), 4326)::geography
                      ) / 1000 <= q.customerTravelRadiusKm`)
            .setParameters({ artistPoint: artistPointGeoJsonString });

        // Filter 2 (Optional): Max distance specified by artist
        if (maxDistance != null) {
            queryBuilder.andWhere(`ST_Distance(
                                        ST_MakePoint(q.customerLon, q.customerLat)::geography,
                                        ST_SetSRID(ST_GeomFromGeoJSON(:artistPoint), 4326)::geography
                                    ) / 1000 <= :maxDistance`)
            queryBuilder.setParameter('maxDistance', maxDistance);
        }

        queryBuilder.orderBy('"distanceToArtistKm"' , 'ASC') // Order by calculated distance
                     .addOrderBy('q.createdAt', 'DESC');

        // Add pagination here if needed (.skip(), .take())

        this.logger.debug(`Executing query: ${queryBuilder.getSql()}`);
        const rawQuotations = await queryBuilder.getRawMany<OpenQuotationListItemDto>();

        // TODO: Consider fetching basic customer info and attaching it if needed for the DTO

        // 3. Fetch offers for the retrieved quotations
        const quotationIds = rawQuotations.map(q => q.id);
        let offersMap = new Map<string, OpenQuotationOfferDto[]>();

        if (quotationIds.length > 0) {
            const offers = await this.quotationOfferRepo.find({
                where: { quotationId: In(quotationIds) },
                relations: ['artist'], // Eagerly load artist basic info if relation exists
            });

            // Fetch artist names if not included in relation or need specific fields
            const artistIds = [...new Set(offers.map(o => o.artistId))];
            const artists = await this.artistRepo.find({ where: { id: In(artistIds) }, select: ['id', 'firstName', 'lastName'] }); // Select firstName, lastName
            const artistNameMap = new Map(artists.map(a => [a.id, `${a.firstName} ${a.lastName}`])); // Combine names

            // Group offers by quotationId
            offersMap = offers.reduce((map, offer) => {
                const offerDto: OpenQuotationOfferDto = {
                    id: offer.id,
                    artistId: offer.artistId,
                    // Use artist name from map
                    artistName: artistNameMap.get(offer.artistId) ?? 'Unknown Artist',
                    estimatedCost: offer.estimatedCost,
                    message: offer.message,
                };
                const existing = map.get(offer.quotationId) || [];
                existing.push(offerDto);
                map.set(offer.quotationId, existing);
                return map;
            }, new Map<string, OpenQuotationOfferDto[]>());
        }

        // 4. Combine quotations with their offers
        const results = rawQuotations.map(quotation => ({
            ...quotation,
            offers: offersMap.get(quotation.id) || [],
        }));

        return { quotations: results };
    }
} 