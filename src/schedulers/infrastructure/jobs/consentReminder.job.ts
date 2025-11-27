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
export class ConsentReminderJob extends BaseComponent {
  constructor(
    private readonly agendaEventRepository: AgendaEventRepository,
    private readonly reminderCalculationService: ReminderCalculationService,
    @InjectQueue(queues.notification.name)
    private readonly notificationQueue: Queue,
  ) {
    super(ConsentReminderJob.name);
  }

  /**
   * Check for consent reminders every hour
   */
  @Cron('0 * * * *')
  async processConsentReminders() {
    this.logger.log('Starting consent reminder processing...');

    try {
      // Process consent reminder types
      await Promise.all([
        this.processRemindersForType(ReminderType.CONSENT_12H_BEFORE),
        this.processRemindersForType(ReminderType.CONSENT_2H_BEFORE),
      ]);

      this.logger.log('Consent reminder processing completed');
    } catch (error) {
      this.logger.error('Error processing consent reminders:', error);
    }
  }

  private async processRemindersForType(reminderType: ReminderType) {
    const { startTime, endTime } =
      this.reminderCalculationService.getSQLTimestampsForReminder(reminderType);

    // Get events that need consent reminders - confirmed events without signed consent
    const events = await this.agendaEventRepository.findEventsNeedingConsent(
      startTime,
      endTime,
      [AgendaEventStatus.CONFIRMED, AgendaEventStatus.RESCHEDULED],
    );

    this.logger.log(
      `Found ${events.length} events needing ${reminderType} consent reminders`,
    );

    for (const event of events) {
      // Check if this reminder was already sent
      if (event.reminderSent && event.reminderSent[reminderType]) {
        this.logger.debug(
          `Consent reminder ${reminderType} already sent for event ${event.id}`,
        );
        continue;
      }

      await this.sendConsentReminder(event, reminderType);
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

  private async sendConsentReminder(event: any, reminderType: ReminderType) {
    try {
      // Add job to notification queue
      await this.notificationQueue.add('CONSENT_REMINDER', {
        jobId: 'CONSENT_REMINDER',
        notificationTypeId: 'EMAIL_AND_PUSH',
        metadata: {
          customerId: event.customerId,
          eventId: event.id,
          artistId: event.artistId,
          reminderType,
          appointmentDate: event.startDate,
        },
      });

      this.logger.log(
        `Queued ${reminderType} consent reminder for event ${event.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to queue ${reminderType} consent reminder for event ${event.id}:`,
        error,
      );
    }
  }
}
