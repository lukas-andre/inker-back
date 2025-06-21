import { InjectQueue } from '@nestjs/bull';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Queue } from 'bull';

import { ArtistRepository } from '../../../artists/infrastructure/repositories/artist.repository';
import {
  DomainBadRule,
  DomainConflict,
  DomainNotFound,
} from '../../../global/domain/exceptions/domain.exception';
import {
  BaseUseCase,
  UseCase,
} from '../../../global/domain/usecases/base.usecase';
import { NewOfferReceivedJobType } from '../../../queues/notifications/domain/schemas/quotationOffer.schema';
import { queues } from '../../../queues/queues';
import { CreateQuotationOfferReqDto } from '../../infrastructure/dtos/createQuotationOfferReq.dto';
import {
  QuotationStatus,
  QuotationType,
} from '../../infrastructure/entities/quotation.entity';
import { QuotationOfferStatus } from '../../infrastructure/entities/quotationOffer.entity';
import { QuotationRepository } from '../../infrastructure/repositories/quotation.provider';
import { QuotationOfferRepository } from '../../infrastructure/repositories/quotationOffer.repository';

@Injectable()
export class SubmitQuotationOfferUseCase
  extends BaseUseCase
  implements UseCase, OnModuleDestroy
{
  constructor(
    private readonly quotationRepo: QuotationRepository,
    private readonly offerRepo: QuotationOfferRepository,
    private readonly artistRepo: ArtistRepository,
    @InjectQueue(queues.notification.name)
    private readonly notificationQueue: Queue,
  ) {
    super(SubmitQuotationOfferUseCase.name);
  }

  async onModuleDestroy() {
    await this.notificationQueue.close();
  }

  async execute(
    quotationId: string,
    artistId: string,
    dto: CreateQuotationOfferReqDto,
  ): Promise<{ id: string; created: boolean }> {
    // 1. Validate Artist
    const artistExists = await this.artistRepo.exists(artistId);
    if (!artistExists) {
      throw new DomainNotFound('Artist not found');
    }

    // 2. Validate Quotation
    const quotation = await this.quotationRepo.findById(quotationId);
    if (!quotation) {
      throw new DomainNotFound('Quotation not found');
    }
    if (
      quotation.type !== QuotationType.OPEN ||
      quotation.status !== QuotationStatus.OPEN
    ) {
      throw new DomainBadRule('Cannot submit offer for non-open quotation');
    }

    // 3. Check for existing offer from this artist
    const existingOffer = await this.offerRepo.findByQuotationIdsNative([
      quotationId,
    ]);
    if (existingOffer && existingOffer.length > 0) {
      throw new DomainConflict(
        'Artist has already submitted an offer for this quotation',
      );
    }

    // 4. Create and Save Offer using native query
    const offerResult = await this.offerRepo.createOfferNative({
      quotationId,
      artistId,
      estimatedCost: dto.estimatedCost,
      estimatedDate: dto.appointmentDate,
      estimatedDuration: dto.appointmentDuration,
      message: dto.message,
      status: QuotationOfferStatus.SUBMITTED,
    });

    const savedOfferId = offerResult.id;

    // 5. Dispatch Notification to Customer
    try {
      const notificationJob: NewOfferReceivedJobType = {
        jobId: 'NEW_OFFER_RECEIVED',
        metadata: {
          offerId: savedOfferId, // Use the ID from the native query result
          quotationId: quotationId,
          customerId: quotation.customerId,
          artistId: artistId,
        },
        notificationTypeId: 'EMAIL_AND_PUSH', // Or adjust as needed
      };
      await this.notificationQueue.add(notificationJob);
    } catch (queueError) {
      this.logger.error(
        `Failed to add NewOfferReceived notification job for offer ${savedOfferId}: ${
          (queueError as Error).message
        }`,
        (queueError as Error).stack,
      );
      // Decide if this should be a critical failure
    }

    return { id: savedOfferId, created: true };
  }
}
