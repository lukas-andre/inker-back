import { Injectable } from '@nestjs/common';
import { In } from 'typeorm';

import {
    BaseUseCase,
    UseCase,
} from '../../global/domain/usecases/base.usecase';
import { QuotationRepository } from '../infrastructure/repositories/quotation.provider';
import { QuotationOfferRepository } from '../infrastructure/repositories/quotationOffer.repository';
import { ArtistRepository } from '../../artists/infrastructure/repositories/artist.repository';
import {
    DomainNotFound,
    DomainForbidden,
} from '../../global/domain/exceptions/domain.exception';
import { QuotationStatus, QuotationType } from '../infrastructure/entities/quotation.entity';
import { ListQuotationOffersResDto } from '../infrastructure/dtos/listQuotationOffersRes.dto';
import { calculateHaversineDistance } from '../../global/infrastructure/utils/geolocation.utils'; // Needed again
import { ArtistLocationRepository } from '../../locations/infrastructure/database/artistLocation.repository';
import { ArtistDto } from '../../artists/domain/dtos/artist.dto';
import { Artist } from '../../artists/infrastructure/entities/artist.entity'; // Import Artist for type info
import { ArtistLocation } from '../../locations/infrastructure/database/entities/artistLocation.entity';
import { QuotationOfferListItemDto } from '../domain/dtos/quotationOffer.dto';

@Injectable()
export class ListQuotationOffersUseCase extends BaseUseCase implements UseCase {
    constructor(
        private readonly quotationRepo: QuotationRepository,
        private readonly offerRepo: QuotationOfferRepository,
        private readonly artistRepo: ArtistRepository, // For fetching artist details
        private readonly artistLocationRepo: ArtistLocationRepository, // For fetching artist location
    ) {
        super(ListQuotationOffersUseCase.name);
    }

    async execute(
        quotationId: string,
        customerId: string,
    ): Promise<ListQuotationOffersResDto> {
        // 1. Validate Quotation and Ownership
        const quotation = await this.quotationRepo.findOne({
            where: { id: quotationId, customerId },
        });

        if (!quotation) {
            throw new DomainNotFound('Open quotation not found or access denied');
        }
        if (quotation.type !== QuotationType.OPEN) {
            throw new DomainForbidden('Cannot list offers for a non-open quotation');
        }
        if (quotation.status !== QuotationStatus.OPEN) {
            this.logger.warn(`Listing offers for quotation ${quotationId} in status ${quotation.status}`);
        }
        if (!quotation.customerLat || !quotation.customerLon) {
            this.logger.error(`Quotation ${quotationId} is OPEN but missing customer location.`);
            throw new DomainNotFound('Internal Server Error: Quotation location missing');
        }

        // 2. Get Offers (agenda DB)
        const offers = await this.offerRepo.find({
            where: { quotationId },
            order: { createdAt: 'ASC' },
        });

        if (!offers || offers.length === 0) {
            return { offers: [] };
        }

        // 3. Get Artist IDs from offers
        const artistIds = [...new Set(offers.map(o => o.artistId as string))];

        // 4. Fetch Artist Details (artist DB)
        const artists = await this.artistRepo.findByIds(artistIds);
        const artistsMap = new Map<string, Artist>(artists.map(a => [a.id, a]));

        // 5. Fetch Artist Locations (artist DB or locations DB)
        // Assuming primary location is locationOrder: 1
        const locations = await this.artistLocationRepo.find({
            where: { artistId: In(artistIds), isActive: true, locationOrder: 1 },
        });
        const locationsMap = new Map<string, ArtistLocation>(locations.map(l => [l.artistId, l]));

        // 6. Combine data, calculate distance, and map to DTO
        const offerDtos: QuotationOfferListItemDto[] = offers.map(offer => {
            const artistEntity = artistsMap.get(offer.artistId);
            const artistLocation = locationsMap.get(offer.artistId);
            let distanceToCustomerKm: number | undefined;
            let artistDto: ArtistDto | undefined;

            if (artistEntity) {
                // Map Artist Entity to ArtistDto
                artistDto = {
                    id: artistEntity.id,
                    userId: artistEntity.userId,
                    username: artistEntity.username,
                    firstName: artistEntity.firstName,
                    lastName: artistEntity.lastName,
                    profileThumbnail: artistEntity.profileThumbnail,
                    rating: artistEntity.rating,
                    createdAt: artistEntity.createdAt,
                    updatedAt: artistEntity.updatedAt,
                    shortDescription: artistEntity.shortDescription,
                };

                // Calculate distance if location is available
                if (artistLocation && artistLocation.lat && artistLocation.lng) {
                    distanceToCustomerKm = calculateHaversineDistance(
                        { lat: quotation.customerLat, lon: quotation.customerLon },
                        { lat: artistLocation.lat, lon: artistLocation.lng },
                    );
                } else {
                    this.logger.warn(`Primary location not found for artist ${offer.artistId}`);
                }
            } else {
                 this.logger.warn(`Artist details not found for artist ${offer.artistId}`);
            }

            const offerDto: QuotationOfferListItemDto = {
                id: offer.id,
                quotationId: offer.quotationId,
                artistId: offer.artistId,
                estimatedCost: offer.estimatedCost,
                estimatedDuration: offer.estimatedDuration,
                message: offer.message,
                status: offer.status,
                createdAt: offer.createdAt,
                updatedAt: offer.updatedAt,
                artist: artistDto,
                distanceToCustomerKm,
            };
            return offerDto;
        });

        return { offers: offerDtos };
    }
} 