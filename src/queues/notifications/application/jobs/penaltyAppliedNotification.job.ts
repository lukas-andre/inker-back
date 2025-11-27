import { Injectable, Logger } from '@nestjs/common';

import { AgendaEventRepository } from '../../../../agenda/infrastructure/repositories/agendaEvent.repository';
import { QuotationRepository } from '../../../../agenda/infrastructure/repositories/quotation.provider';
import { ArtistRepository } from '../../../../artists/infrastructure/repositories/artist.repository';
import { CustomerRepository } from '../../../../customers/infrastructure/providers/customer.repository';
import { ArtistLocationRepository } from '../../../../locations/infrastructure/database/artistLocation.repository';
import { EmailNotificationService } from '../../../../notifications/services/email/email.notification';
import { NotificationStorageService } from '../../../../notifications/services/notification.storage';
import { PushNotificationService } from '../../../../notifications/services/push/pushNotification.service';
import {
  PENALTY_APPLIED_NOTIFICATION_V1,
  PenaltyAppliedNotificationV1Job,
} from '../../domain/schemas/penaltyNotification.schema';

import { NotificationJob } from './notification.job';

@Injectable()
export class PenaltyAppliedNotificationJob extends NotificationJob {
  private readonly logger = new Logger(PenaltyAppliedNotificationJob.name);
  constructor(
    readonly emailNotificationService: EmailNotificationService,
    readonly agendaEventProvider: AgendaEventRepository,
    readonly artistProvider: ArtistRepository,
    readonly customerProvider: CustomerRepository,
    readonly locationProvider: ArtistLocationRepository,
    readonly quotationProvider: QuotationRepository,
    readonly pushNotificationService: PushNotificationService,
    readonly notificationStorageService: NotificationStorageService,
  ) {
    super(
      emailNotificationService,
      agendaEventProvider,
      artistProvider,
      customerProvider,
      locationProvider,
      quotationProvider,
      pushNotificationService,
      notificationStorageService,
    );
  }

  async handle(job: PenaltyAppliedNotificationV1Job): Promise<void> {
    this.logger.log(
      `Processing ${PENALTY_APPLIED_NOTIFICATION_V1} job for user ${job.userId}`,
      { data: job },
    );

    // TODO: Implement actual notification logic
    // This might involve:
    // 1. Fetching user details (e.g., email, push tokens) if not in job data
    // 2. Formatting the notification message (possibly using i18n based on job.recipientLocale)
    // 3. Sending email via this.emailNotificationService
    // 4. Sending push notification via this.pushNotificationService
    // 5. Storing the notification via this.notificationStorageService

    if (job.recipientEmail) {
      // Example: Send an email
      try {
        await this.emailNotificationService.sendPenaltyAppliedEmail(
          job.recipientEmail,
          {
            userName: 'User', // Replace with actual user name
            penaltyAmount: job.penaltyAmount,
            currency: job.currency,
            reason: job.reason,
            cancellationReason: job.cancellationReason,
            eventId: job.eventId,
          },
          job.recipientLocale,
        );
        this.logger.log(
          `Email sent for ${PENALTY_APPLIED_NOTIFICATION_V1} to ${job.recipientEmail}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to send email for ${PENALTY_APPLIED_NOTIFICATION_V1} to ${job.recipientEmail}`,
          error,
        );
      }
    }

    // Example: Send a push notification (assuming you have a method like sendPenaltyAppliedPush)
    /*
    try {
      await this.pushNotificationService.sendPenaltyAppliedPush(job.userId, {
        penaltyAmount: job.penaltyAmount,
        currency: job.currency,
        reason: job.reason,
      });
      this.logger.log(`Push notification sent for ${PENALTY_APPLIED_NOTIFICATION_V1} to user ${job.userId}`);
    } catch (error) {
      this.logger.error(
        `Failed to send push notification for ${PENALTY_APPLIED_NOTIFICATION_V1} to user ${job.userId}`,
        error,
      );
    }
    */

    // Example: Store the notification
    /*
    try {
      await this.notificationStorageService.createNotification({
        userId: job.userId,
        type: PENALTY_APPLIED_NOTIFICATION_V1, // Or a more generic notification type
        title: 'Penalty Applied',
        body: `A penalty of ${job.penaltyAmount} ${job.currency} was applied. Reason: ${job.reason}`,
        data: job,
      });
      this.logger.log(`Notification stored for ${PENALTY_APPLIED_NOTIFICATION_V1} for user ${job.userId}`);
    } catch (error) {
      this.logger.error(
        `Failed to store notification for ${PENALTY_APPLIED_NOTIFICATION_V1} for user ${job.userId}`,
        error,
      );
    }
    */

    this.logger.log(
      `Finished processing ${PENALTY_APPLIED_NOTIFICATION_V1} job for user ${job.userId}`,
    );
  }
}
