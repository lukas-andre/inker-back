import { Injectable } from '@nestjs/common';
import { In } from 'typeorm';

import {
  BaseUseCase,
  UseCase,
} from '../../global/domain/usecases/base.usecase';
import { QuotationOfferRepository } from '../infrastructure/repositories/quotationOffer.repository';
import { QuotationStatus, QuotationType } from '../infrastructure/entities/quotation.entity';
import { CustomerDto } from '../../customers/domain/dtos/customer.dto';
import { ArtistDto } from '../../artists/domain/dtos/artist.dto';
import { CustomerRepository } from '../../customers/infrastructure/providers/customer.repository';
import { ArtistRepository } from '../../artists/infrastructure/repositories/artist.repository';
import { ParticipatingQuotationOfferDto, ListParticipatingQuotationsResDto, NestedQuotationDto } from '../domain/dtos/participatingQuotationOffer.dto';
import { MoneyEntity } from '../../global/domain/models/money.model';
import { QuotationOfferStatus } from '../infrastructure/entities/quotationOffer.entity';
import { Quotation } from '../infrastructure/entities/quotation.entity';

// Optional: Define a query DTO if pagination/filtering is needed
// import { ListParticipatingQuotationsQueryDto } from '../infrastructure/dtos/listParticipatingQuotationsQuery.dto';

@Injectable()
export class ListParticipatingQuotationsUseCase
  extends BaseUseCase
  implements UseCase
{
  constructor(
    private readonly quotationOfferRepo: QuotationOfferRepository,
    private readonly customerRepo: CustomerRepository,
    private readonly artistRepo: ArtistRepository,
  ) {
    super(ListParticipatingQuotationsUseCase.name);
  }

  async execute(
    artistId: string,
    // queryDto?: ListParticipatingQuotationsQueryDto // Add if query DTO is created
  ): Promise<ListParticipatingQuotationsResDto> {
    this.logger.log(
      `Listing quotation offers where artist ${artistId} is participating`,
    );

    // TODO: Add pagination parameters (skip, take) if queryDto is implemented
    const skip = 0; // Example: Extract from queryDto?.page, queryDto?.limit
    const take = 50; // Example: Extract from queryDto?.limit

    const queryBuilder = this.quotationOfferRepo.repo.createQueryBuilder('offer');

    queryBuilder
      .innerJoinAndSelect('offer.quotation', 'q')
      .where('offer.artistId = :artistId', { artistId })
      .andWhere('q.status NOT IN (:...excludedStatuses)', {
        excludedStatuses: [QuotationStatus.CANCELED, QuotationStatus.REJECTED],
      })
      .select([
        'offer.id',
        'offer.quotationId',
        'offer.artistId',
        'offer.estimatedCost',
        'offer.estimatedDuration',
        'offer.message',
        'offer.status',
        'offer.createdAt',
        'offer.updatedAt',
        'offer.messages',
        'q.id',
        'q.description',
        'q.status',
        'q.type',
        'q.customerId',
        'q.referenceImages',
        'q.createdAt',
        'q.updatedAt',
        'q.customerLat',
        'q.customerLon',
      ])
      .orderBy('offer.updatedAt', 'DESC')
      .skip(skip)
      .take(take);

    const [offers, total] = await queryBuilder.getManyAndCount();

    if (offers.length === 0) {
      return { items: [], total: 0 };
    }

    const customerIds = [...new Set(offers.map(o => o.quotation.customerId).filter(Boolean))];
    const artistIds = [artistId];

    let customersMap = new Map<string, CustomerDto>();
    if (customerIds.length > 0) {
      const customers = await this.customerRepo.find({ where: { id: In(customerIds) } });
      customersMap = new Map(
        customers.map(c => [
          c.id,
          {
            id: c.id,
            userId: c.userId,
            firstName: c.firstName,
            lastName: c.lastName,
            profileThumbnail: c.profileThumbnail,
            contactEmail: c.contactEmail,
            contactPhoneNumber: c.contactPhoneNumber,
            follows: c.follows,
            rating: c.rating,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
            shortDescription: c.shortDescription,
          } as CustomerDto,
        ]),
      );
    }

    let artistsMap = new Map<string, ArtistDto>();
    if (artistIds.length > 0) {
      const artists = await this.artistRepo.find({ where: { id: In(artistIds) } });
      artistsMap = new Map(
        artists.map(a => [
          a.id,
          {
            id: a.id,
            userId: a.userId,
            username: a.username,
            firstName: a.firstName,
            lastName: a.lastName,
            profileThumbnail: a.profileThumbnail,
            rating: a.rating,
            createdAt: a.createdAt,
            updatedAt: a.updatedAt,
            shortDescription: a.shortDescription,
            studioPhoto: a.studioPhoto,
          } as ArtistDto,
        ]),
      );
    }

    const items: ParticipatingQuotationOfferDto[] = offers.map((offer) => {
      const quotation = offer.quotation;
      const customerDto = customersMap.get(quotation.customerId);
      const artistDto = artistsMap.get(offer.artistId);

      if (!customerDto) {
        this.logger.warn(
          `Customer data not found for ID: ${quotation.customerId} related to offer ${offer.id}. Skipping.`,
        );
        return null;
      }

      const quotationDto: NestedQuotationDto = {
        id: quotation.id,
        description: quotation.description,
        status: quotation.status,
        type: quotation.type as QuotationType,
        referenceImages: quotation.referenceImages as unknown as string[] | undefined,
        createdAt: quotation.createdAt,
        updatedAt: quotation.updatedAt,
      };

      return {
        id: offer.id,
        quotationId: offer.quotationId,
        artistName: artistDto.username,
        artistId: offer.artistId,
        estimatedCost: offer.estimatedCost as MoneyEntity | undefined,
        estimatedDuration: offer.estimatedDuration,
        message: offer.message,
        status: offer.status,
        createdAt: offer.createdAt,
        updatedAt: offer.updatedAt,
        messages: offer.messages,
        artist: artistDto,
        distanceToCustomerKm: undefined,
        quotation: quotationDto,
        customer: customerDto,
      };
    }).filter(item => item !== null) as ParticipatingQuotationOfferDto[];

    return {
      items,
      total,
    };
  }
} 