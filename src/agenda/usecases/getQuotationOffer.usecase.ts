import { Injectable, NotFoundException } from '@nestjs/common';
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
import { ParticipatingQuotationOfferDto, NestedQuotationDto } from '../domain/dtos/participatingQuotationOffer.dto';
import { MoneyEntity } from '../../global/domain/models/money.model';
import { QuotationOfferStatus } from '../infrastructure/entities/quotationOffer.entity';

/**
 * Use case for retrieving a single quotation offer with detailed information
 */
@Injectable()
export class GetQuotationOfferUseCase extends BaseUseCase implements UseCase {
  constructor(
    private readonly quotationOfferRepo: QuotationOfferRepository,
    private readonly customerRepo: CustomerRepository,
    private readonly artistRepo: ArtistRepository,
  ) {
    super(GetQuotationOfferUseCase.name);
  }

  /**
   * Get a single quotation offer by ID
   * @param offerId The ID of the offer to retrieve
   * @param currentUserId Optional ID of the current user for authorization purposes
   * @returns The offer with detailed quotation, customer, and artist information
   */
  async execute(
    offerId: string,
    currentArtistId?: string,
  ): Promise<ParticipatingQuotationOfferDto> {
    this.logger.log(`Retrieving quotation offer with ID: ${offerId}`);

    // 1. Fetch the offer with its quotation
    const queryBuilder = this.quotationOfferRepo.repo.createQueryBuilder('offer');

    queryBuilder
      .innerJoinAndSelect('offer.quotation', 'q')
      .where('offer.id = :offerId', { offerId })
      .select([
        // Offer fields
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
        // Quotation fields
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
      ]);

    // Optional authorization check
    if (currentArtistId) {
      queryBuilder.andWhere('offer.artistId = :currentArtistId', { currentArtistId });
    }

    const offer = await queryBuilder.getOne();

    if (!offer) {
      throw new NotFoundException(`Quotation offer with ID ${offerId} not found`);
    }

    // 2. Fetch customer and artist data
    const [customer, artist] = await Promise.all([
      this.customerRepo.findOne({ where: { id: offer.quotation.customerId } }),
      this.artistRepo.findOne({ where: { id: offer.artistId } }),
    ]);

    if (!customer) {
      this.logger.warn(`Customer with ID ${offer.quotation.customerId} not found`);
      throw new NotFoundException(`Customer for this offer not found`);
    }

    // 3. Map to DTO with nested quotation
    const customerDto: CustomerDto = {
      id: customer.id,
      userId: customer.userId,
      firstName: customer.firstName,
      lastName: customer.lastName,
      profileThumbnail: customer.profileThumbnail,
      contactEmail: customer.contactEmail,
      contactPhoneNumber: customer.contactPhoneNumber,
      follows: customer.follows,
      rating: customer.rating,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
      shortDescription: customer.shortDescription,
    };

    const artistDto: ArtistDto | undefined = artist ? {
      id: artist.id,
      userId: artist.userId,
      username: artist.username,
      firstName: artist.firstName,
      lastName: artist.lastName,
      profileThumbnail: artist.profileThumbnail,
      rating: artist.rating,
      createdAt: artist.createdAt,
      updatedAt: artist.updatedAt,
      shortDescription: artist.shortDescription,
      studioPhoto: artist.studioPhoto,
    } : undefined;

    // Create nested quotation DTO
    const quotationDto: NestedQuotationDto = {
      id: offer.quotation.id,
      description: offer.quotation.description,
      status: offer.quotation.status,
      type: offer.quotation.type as QuotationType,
      referenceImages: offer.quotation.referenceImages as unknown as string[] | undefined,
      createdAt: offer.quotation.createdAt,
      updatedAt: offer.quotation.updatedAt,
    };

    // Return the complete offer DTO
    return {
      // Offer details
      id: offer.id,
      quotationId: offer.quotationId,
      artistId: offer.artistId,
      estimatedCost: offer.estimatedCost as MoneyEntity | undefined,
      estimatedDuration: offer.estimatedDuration,
      message: offer.message,
      status: offer.status,
      createdAt: offer.createdAt,
      updatedAt: offer.updatedAt,
      messages: offer.messages,
      artist: artistDto,
      distanceToCustomerKm: undefined, // Would need to calculate if required

      // Nested objects
      quotation: quotationDto,
      customer: customerDto,
    };
  }
} 