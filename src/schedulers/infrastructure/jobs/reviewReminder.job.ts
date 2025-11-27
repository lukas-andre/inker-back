import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Queue } from 'bull';

import { AgendaEventStatus } from '../../../agenda/domain/enum/agendaEventStatus.enum';
import { AgendaEventRepository } from '../../../agenda/infrastructure/repositories/agendaEvent.repository';
import { BaseComponent } from '../../../global/domain/components/base.component';
import { queues } from '../../../queues/queues';
import { ReminderType } from '../../domain/enums/reminderType.enum';
import { ReminderCalculationService } from '../../domain/services/reminderCalculation.service';

@Injectable()
export class ReviewReminderJob extends BaseComponent {
  constructor(
    private readonly agendaEventRepository: AgendaEventRepository,
    private readonly reminderCalculationService: ReminderCalculationService,
    @InjectQueue(queues.notification.name)
    private readonly notificationQueue: Queue,
  ) {
    super(ReviewReminderJob.name);
  }

  /**
   * Check for review reminders every 2 hours
   */
  @Cron('0 */2 * * *')
  async processReviewReminders() {
    this.logger.log('Starting review reminder processing...');

    try {
      // Process review reminder types
      await Promise.all([
        this.processRemindersForType(ReminderType.REVIEW_REQUEST_24H_AFTER),
        this.processRemindersForType(ReminderType.REVIEW_REQUEST_48H_AFTER),
      ]);

      this.logger.log('Review reminder processing completed');
    } catch (error) {
      this.logger.error('Error processing review reminders:', error);
    }
  }

  private async processRemindersForType(reminderType: ReminderType) {
    const { startTime, endTime } =
      this.reminderCalculationService.getSQLTimestampsForReminder(reminderType);

    // Get completed events that need review reminders
    const events =
      await this.agendaEventRepository.findCompletedEventsForReviewReminder(
        startTime,
        endTime,
        [AgendaEventStatus.COMPLETED, AgendaEventStatus.WAITING_FOR_REVIEW],
      );

    this.logger.log(
      `Found ${events.length} completed events needing ${reminderType} review reminders`,
    );

    for (const event of events) {
      // Check if this reminder was already sent
      if (event.reminderSent && event.reminderSent[reminderType]) {
        this.logger.debug(
          `Review reminder ${reminderType} already sent for event ${event.id}`,
        );
        continue;
      }

      await this.sendReviewReminder(event, reminderType);
    }

    // Mark reminders as sent
    const eventIds = events
      .filter(e => !e.reminderSent || !e.reminderSent[reminderType])
      .map(e => e.id);

    if (eventIds.length > 0) {
      await this.agendaEventRepository.markRemindersAsSent(
        eventIds,
        reminderType,
      );
    }
  }

  private async sendReviewReminder(event: any, reminderType: ReminderType) {
    try {
      // Add job to notification queue
      await this.notificationQueue.add('REVIEW_REMINDER', {
        jobId: 'REVIEW_REMINDER',
        notificationTypeId: 'EMAIL_AND_PUSH',
        metadata: {
          customerId: event.customerId,
          eventId: event.id,
          artistId: event.artistId,
          reminderType,
        },
      });

      this.logger.log(
        `Queued ${reminderType} review reminder for event ${event.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to queue ${reminderType} review reminder for event ${event.id}:`,
        error,
      );
    }
  }
}
