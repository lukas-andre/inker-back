import { InjectQueue } from '@nestjs/bull';
import {
  Inject,
  Injectable,
  OnModuleDestroy,
  forwardRef,
} from '@nestjs/common';
import { Queue } from 'bull';
import { DataSource, Equal, In, Not } from 'typeorm';

import {
  DomainBadRule,
  DomainConflict,
  DomainForbidden,
  DomainNotFound,
} from '../../../global/domain/exceptions/domain.exception';
import {
  BaseUseCase,
  UseCase,
} from '../../../global/domain/usecases/base.usecase';
import {
  OfferAcceptedJobType,
  OfferRejectedJobType,
} from '../../../queues/notifications/domain/schemas/quotationOffer.schema';
import { queues } from '../../../queues/queues';
import { CreateAgendaEventJobType } from '../../../queues/sync/jobs';
import { QuotationStateMachine } from '../../domain/quotation.statemachine';
import {
  QuotationStatus,
  QuotationType,
} from '../../infrastructure/entities/quotation.entity';
import {
  QuotationOffer,
  QuotationOfferStatus,
} from '../../infrastructure/entities/quotationOffer.entity';
import { QuotationRepository } from '../../infrastructure/repositories/quotation.provider';
import { QuotationOfferRepository } from '../../infrastructure/repositories/quotationOffer.repository';

@Injectable()
export class AcceptQuotationOfferUseCase
  extends BaseUseCase
  implements UseCase, OnModuleDestroy
{
  private readonly transitionToStatus = QuotationStatus.ACCEPTED;

  constructor(
    private readonly quotationRepo: QuotationRepository,
    private readonly offerRepo: QuotationOfferRepository,
    private readonly stateMachine: QuotationStateMachine,
    @InjectQueue(queues.notification.name)
    private readonly notificationQueue: Queue,
    @InjectQueue(queues.sync.name)
    private readonly syncQueue: Queue,
  ) {
    super(AcceptQuotationOfferUseCase.name);
  }

  async onModuleDestroy() {
    await this.notificationQueue.close();
    await this.syncQueue.close();
  }

  async execute(
    quotationId: string,
    offerId: string,
    customerId: string,
  ): Promise<{ success: boolean; message: string }> {
    // Use QueryRunner for transaction
    const queryRunner = this.quotationRepo.source.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let acceptedOfferArtistId: string | null = null;
    let rejectedOfferArtistIds: string[] = [];

    try {
      // 1. Get and Validate Quotation within transaction
      const quotation = await queryRunner.manager.findOne(
        this.quotationRepo.repo.target,
        {
          where: { id: quotationId, customerId },
          lock: { mode: 'pessimistic_write' }, // Lock row for update
        },
      );

      if (!quotation) {
        throw new DomainNotFound('Open quotation not found or access denied');
      }
      if (quotation.type !== QuotationType.OPEN) {
        throw new DomainForbidden(
          'Cannot accept offer for a non-open quotation',
        );
      }
      if (quotation.status !== QuotationStatus.OPEN) {
        // Allow accepting only from OPEN status? Or AWAITING_SELECTION?
        throw new DomainConflict(
          `Quotation is not in OPEN status (current: ${quotation.status})`,
        );
      }

      // Transition the quotation to the accepted status
      this.stateMachine.transition(quotation, this.transitionToStatus);

      // 2. Get and Validate Accepted Offer within transaction
      const acceptedOffer = await queryRunner.manager.findOne(QuotationOffer, {
        where: { id: offerId, quotationId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!acceptedOffer) {
        throw new DomainNotFound('Offer not found for this quotation');
      }
      if (acceptedOffer.status !== QuotationOfferStatus.SUBMITTED) {
        throw new DomainConflict('Offer is not in SUBMITTED status');
      }
      acceptedOfferArtistId = acceptedOffer.artistId;

      // 3. Get Other Offers to Reject within transaction
      const otherOffers = await queryRunner.manager.find(QuotationOffer, {
        where: {
          quotationId,
          id: Not(Equal(offerId)), // Correctly exclude the accepted offer ID
          status: QuotationOfferStatus.SUBMITTED,
        },
        select: ['id', 'artistId'],
      });
      rejectedOfferArtistIds = otherOffers.map(o => o.artistId);

      // --- Perform Updates within Transaction ---

      // 4. Update Accepted Offer
      await queryRunner.manager.update(QuotationOffer, offerId, {
        status: QuotationOfferStatus.ACCEPTED,
      });

      // 5. Update Rejected Offers
      if (otherOffers.length > 0) {
        const otherOfferIds = otherOffers.map(o => o.id);
        // Use { id: In(...) } for updating multiple records by ID
        await queryRunner.manager.update(
          QuotationOffer,
          { id: In(otherOfferIds) },
          {
            status: QuotationOfferStatus.REJECTED,
          },
        );
      }

      // 6. Update Original Quotation
      await queryRunner.manager.update(
        this.quotationRepo.repo.target,
        quotationId,
        {
          artistId: acceptedOffer.artistId,
          estimatedCost: acceptedOffer.estimatedCost,
          // Assuming appointmentDuration in the offer corresponds to appointmentDuration in quotation
          appointmentDuration: acceptedOffer.estimatedDuration,
          status: this.transitionToStatus, // Transition to QUOTED state
          responseDate: new Date(), // Mark response date
          lastUpdatedBy: customerId, // Track who triggered the update
          lastUpdatedByUserType: 'customer',
          // Reset read flags?
          readByArtist: false,
          readByCustomer: true, // Customer initiated
          artistReadAt: null,
          customerReadAt: new Date(),
        },
      );

      // 7. Create Agenda Event (Removed direct call)
      // await this.createAgendaEventUC.execute({ ... }); // Removed

      // --- Commit Transaction ---
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Failed to accept offer ${offerId} for quotation ${quotationId}: ${
          (error as Error).message
        }`,
        (error as Error).stack,
      );
      // Re-throw specific errors or a generic one
      if (
        error instanceof DomainNotFound ||
        error instanceof DomainForbidden ||
        error instanceof DomainConflict ||
        error instanceof DomainBadRule
      ) {
        throw error;
      }
      throw new DomainBadRule('Failed to accept quotation offer');
    } finally {
      await queryRunner.release();
    }

    // --- Dispatch Notifications & Sync Job (After successful commit) ---
    try {
      // Notify winning artist
      if (acceptedOfferArtistId) {
        const acceptedJob: OfferAcceptedJobType = {
          jobId: 'OFFER_ACCEPTED',
          metadata: {
            offerId: offerId,
            quotationId: quotationId,
            customerId: customerId,
            acceptedArtistId: acceptedOfferArtistId,
          },
          notificationTypeId: 'EMAIL_AND_PUSH',
        };
        await this.notificationQueue.add(acceptedJob);
      }

      // Notify losing artists
      for (const rejectedArtistId of rejectedOfferArtistIds) {
        // Find the rejected offer ID again (could store this earlier)
        const rejectedOffer = await this.offerRepo.findOne({
          where: { quotationId, artistId: rejectedArtistId },
        });
        if (rejectedOffer) {
          const rejectedJob: OfferRejectedJobType = {
            jobId: 'OFFER_REJECTED',
            metadata: {
              offerId: rejectedOffer.id, // Need the specific offer ID
              quotationId: quotationId,
              customerId: customerId,
              rejectedArtistId: rejectedArtistId,
            },
            notificationTypeId: 'EMAIL_AND_PUSH',
          };
          await this.notificationQueue.add(rejectedJob);
        }
      }
    } catch (queueError) {
      this.logger.error(
        `Failed to add offer acceptance/rejection notification jobs for quotation ${quotationId}: ${
          (queueError as Error).message
        }`,
        (queueError as Error).stack,
      );
      // Log error but don't fail the whole operation as the core logic succeeded
    }

    // Dispatch Sync job to create agenda event
    try {
      if (acceptedOfferArtistId) {
        const syncJob: CreateAgendaEventJobType = {
          jobId: 'CREATE_AGENDA_EVENT',
          metadata: {
            artistId: acceptedOfferArtistId,
            quotationId: quotationId,
          },
        };
        await this.syncQueue.add(syncJob);
        this.logger.log(
          `Dispatched CREATE_AGENDA_EVENT job for quotation ${quotationId}`,
        );
      }
    } catch (syncQueueError) {
      this.logger.error(
        `Failed to add CREATE_AGENDA_EVENT job for quotation ${quotationId}: ${
          (syncQueueError as Error).message
        }`,
        (syncQueueError as Error).stack,
      );
      // Log error, but the main action succeeded
    }

    return { success: true, message: 'Offer accepted successfully.' };
  }
}
