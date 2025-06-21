import { Injectable } from '@nestjs/common';
import stringify from 'fast-safe-stringify';
import { Point } from 'geojson';
import { In } from 'typeorm';

import { ArtistRepository } from '../../../artists/infrastructure/repositories/artist.repository';
import {
  BaseUseCase,
  UseCase,
} from '../../../global/domain/usecases/base.usecase';
import { ArtistLocationRepository } from '../../../locations/infrastructure/database/artistLocation.repository';
import { OpenQuotationListItemDto } from '../../domain/dtos/openQuotationListItem.dto';
import { QuotationEnrichmentService } from '../../domain/services/quotationEnrichment.service';
import {
  GetOpenQuotationsResDto,
  ListOpenQuotationsQueryDto,
} from '../../infrastructure/dtos/listOpenQuotationsQuery.dto';
import {
  QuotationStatus,
  QuotationType,
} from '../../infrastructure/entities/quotation.entity';
import { QuotationRepository } from '../../infrastructure/repositories/quotation.provider';

@Injectable()
export class ListOpenQuotationsUseCase extends BaseUseCase implements UseCase {
  constructor(
    private readonly quotationRepo: QuotationRepository,
    private readonly artistLocationRepo: ArtistLocationRepository,
    private readonly artistRepo: ArtistRepository,
    private readonly quotationEnrichmentService: QuotationEnrichmentService,
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
      where: { artistId, isActive: true, locationOrder: 0 },
    });

    if (!artistLocation || !artistLocation.location) {
      this.logger.warn(`Artist ${artistId} has no primary location set.`);
      return { items: [], total: 0 };
    }

    const artistPoint: Point = artistLocation.location;
    const artistPointGeoJsonString = stringify(artistPoint);

    // 2. Build Query using QueryBuilder from the injected repository
    const queryBuilder = this.quotationRepo.repo.createQueryBuilder('q');

    queryBuilder
      .select([
        'q.id as "id"',
        'q.customerId as "customerId"',
        'q.description as "description"',
        'q.referenceImages as "referenceImages"',
        'q.status as "status"',
        'q.type as "type"',
        'q.customerLat as "customerLat"',
        'q.customerLon as "customerLon"',
        'q.minBudget as "minBudget"',
        'q.maxBudget as "maxBudget"',
        'q.referenceBudget as "referenceBudget"',
        'q.generatedImageId as "generatedImageId"',
        'q.customerTravelRadiusKm as "customerTravelRadiusKm"',
        'q.createdAt as "createdAt"',
        'q.updatedAt as "updatedAt"',
        'q.tattooDesignImageUrl as "tattooDesignImageUrl"',
        `ST_Distance(
                    ST_MakePoint(q.customerLon, q.customerLat)::geography,
                    ST_SetSRID(ST_GeomFromGeoJSON(:artistPoint), 4326)::geography
                ) / 1000 AS "distanceToArtistKm"`,
      ])
      .where('q.status = :status', { status: QuotationStatus.OPEN })
      .andWhere('q.type = :type', { type: QuotationType.OPEN })
      .andWhere(
        `ST_Distance(
                        ST_MakePoint(q.customerLon, q.customerLat)::geography,
                        ST_SetSRID(ST_GeomFromGeoJSON(:artistPoint), 4326)::geography
                      ) / 1000 <= q.customerTravelRadiusKm`,
      )
      .setParameters({ artistPoint: artistPointGeoJsonString });

    if (maxDistance != null) {
      queryBuilder.andWhere(`ST_Distance(
                                        ST_MakePoint(q.customerLon, q.customerLat)::geography,
                                        ST_SetSRID(ST_GeomFromGeoJSON(:artistPoint), 4326)::geography
                                    ) / 1000 <= :maxDistance`);
      queryBuilder.setParameter('maxDistance', maxDistance);
    }

    queryBuilder
      .orderBy('"distanceToArtistKm"', 'ASC')
      .addOrderBy('q.createdAt', 'DESC');

    // Add pagination here if needed (.skip(), .take())

    this.logger.debug(`Executing query: ${queryBuilder.getSql()}`);
    const rawQuotations = await queryBuilder.getRawMany();

    // Enriquecer cotizaciones usando el servicio centralizado
    const enriched = await this.quotationEnrichmentService.enrichQuotations(
      rawQuotations,
      {
        includeOffers: true,
        includeCustomer: true,
        includeHasOffered: true,
        currentArtistId: artistId,
      },
    );

    return {
      items: enriched.map(q => q as OpenQuotationListItemDto),
      total: enriched.length,
    };
  }
}
