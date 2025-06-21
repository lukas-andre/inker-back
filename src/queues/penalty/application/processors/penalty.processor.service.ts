import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Inject, Logger } from '@nestjs/common';
import { Job, Queue } from 'bull';

import { PenaltyStatus, PenaltyType } from '../../../../agenda/domain/enum';
import { CancellationPenaltyRepository } from '../../../../agenda/infrastructure/repositories/cancellationPenalty.repository';
import { IReputationService } from '../../../../reputation/domain/interfaces/reputationService.interface';
import { queues } from '../../../queues'; // Corrected path assuming this file is in src/queues/penalty/application/processors/
import { ProcessPenaltyV1Job } from '../../domain/schemas/penaltyJob.schema';
// import { ReputationService } from '../../../reputation/domain/services/reputation.service'; // Placeholder for point 3
// import { PaymentService } from '../../../payment/domain/services/payment.service'; // Placeholder for financial penalties

@Processor(queues.penaltyProcessing.name)
export class PenaltyProcessorService {
  private readonly logger = new Logger(PenaltyProcessorService.name);

  constructor(
    private readonly cancellationPenaltyRepository: CancellationPenaltyRepository,
    @Inject(IReputationService)
    private readonly reputationService: IReputationService,
    @InjectQueue(queues.notification.name)
    private readonly notificationQueue: Queue, // @Inject(PaymentService) private readonly paymentService: PaymentService, // Placeholder
  ) {}

  @Process('PROCESS_PENALTY_V1')
  async handleProcessPenaltyV1(job: Job<ProcessPenaltyV1Job>): Promise<void> {
    const { penalty } = job.data;
    this.logger.log(
      `Processing penalty ID: ${penalty.id}, Type: ${penalty.type}, User ID: ${penalty.userId}`,
    );

    try {
      // TODO: Point 2 & 3 - Implement actual penalty application logic here
      if (
        (penalty.type === PenaltyType.FIXED_FEE ||
          penalty.type === PenaltyType.PERCENTAGE) &&
        penalty.amount != null &&
        penalty.amount > 0
      ) {
        this.logger.log(
          `Placeholder: Applying financial penalty of ${penalty.amount} to user ${penalty.userId}. Type: ${penalty.type}`,
        );
        // await this.paymentService.chargeUser(penalty.userId, penalty.amount, `Cancellation penalty for event ${penalty.eventId}`);
      }

      if (
        penalty.type === PenaltyType.REPUTATION_POINTS &&
        penalty.reputationPoints != null &&
        penalty.reputationPoints !== 0
      ) {
        this.logger.log(
          `Applying ${penalty.reputationPoints} reputation points to user ${penalty.userId} for event ${penalty.eventId}.`,
        );
        await this.reputationService.adjustReputation(
          penalty.userId,
          penalty.reputationPoints,
          `Cancellation penalty for event ${penalty.eventId}`,
        );
      }

      // Mark penalty as applied if successfully processed by other services
      await this.cancellationPenaltyRepository.update(penalty.id, {
        status: PenaltyStatus.APPLIED,
      });
      this.logger.log(`Penalty ID: ${penalty.id} status updated to APPLIED.`);

      // Send notification about the applied penalty
      const notificationJobPayload = {
        jobId: 'PENALTY_APPLIED_NOTIFICATION_V1', // Define a new job ID for notifications
        penaltyDetails: {
          penaltyId: penalty.id,
          userId: penalty.userId,
          type: penalty.type,
          amount: penalty.amount,
          reputationPoints: penalty.reputationPoints,
          eventId: penalty.eventId,
          reason: penalty.metadata?.reason, // Assuming reason is in metadata
        },
        notificationTypeId: 'EMAIL', // Or PUSH, or both, depending on user preferences/system setup
      };
      try {
        // Validate with PenaltyAppliedNotificationJobSchema before adding if Zod schema is created
        await this.notificationQueue.add(notificationJobPayload);
        this.logger.log(
          `Dispatched PENALTY_APPLIED_NOTIFICATION_V1 job for penalty ID ${penalty.id} to notification queue.`,
        );
      } catch (notifyError) {
        this.logger.error(
          `Failed to dispatch PENALTY_APPLIED_NOTIFICATION_V1 job for penalty ${
            penalty.id
          }. Error: ${
            notifyError instanceof Error
              ? notifyError.message
              : String(notifyError)
          }`,
        );
        // Non-critical, so don't re-throw, but log prominently.
      }
    } catch (error) {
      this.logger.error(
        `Failed to process penalty ID: ${penalty.id}. Error: ${
          error instanceof Error ? error.message : String(error)
        }`,
        error instanceof Error ? error.stack : undefined,
      );
      // Do not update status to FAILED here, let Bull handle retries.
      // If after retries it still fails, it will go to the dead-letter queue (if configured).
      // A separate process could monitor the DLQ for persistently failed penalties.
      throw error; // Re-throw to let Bull handle retries/dead-lettering
    }
  }
}
