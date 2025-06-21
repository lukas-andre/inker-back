import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Queue } from 'bull';

import { AgendaEventStatus } from '../../../agenda/domain/enum/agendaEventStatus.enum';
import { AgendaEventRepository } from '../../../agenda/infrastructure/repositories/agendaEvent.repository';
import { BaseComponent } from '../../../global/domain/components/base.component';
import { queues } from '../../../queues/queues';
import { ReminderType } from '../../domain/enums/reminderType.enum';
import { ReminderCalculationService } from '../../domain/services/reminderCalculation.service';

@Injectable()
export class AppointmentReminderJob extends BaseComponent {
  constructor(
    private readonly agendaEventRepository: AgendaEventRepository,
    private readonly reminderCalculationService: ReminderCalculationService,
    @InjectQueue(queues.notification.name)
    private readonly notificationQueue: Queue,
  ) {
    super(AppointmentReminderJob.name);
  }

  /**
   * Check for appointment reminders every 30 minutes
   */
  @Cron('*/30 * * * *')
  async processAppointmentReminders() {
    this.logger.log('Starting appointment reminder processing...');

    try {
      // Process different reminder types
      await Promise.all([
        this.processRemindersForType(ReminderType.APPOINTMENT_24H_BEFORE),
        this.processRemindersForType(ReminderType.APPOINTMENT_2H_BEFORE),
        this.processRemindersForType(ReminderType.APPOINTMENT_30MIN_BEFORE),
      ]);

      this.logger.log('Appointment reminder processing completed');
    } catch (error) {
      this.logger.error('Error processing appointment reminders:', error);
    }
  }

  /**
   * Run every hour to check for consent reminders
   */
  @Cron(CronExpression.EVERY_HOUR)
  async checkConsentReminders() {
    this.logger.log('Running consent reminders check...');

    try {
      const consentReminderTypes = [
        ReminderType.CONSENT_12H_BEFORE,
        ReminderType.CONSENT_2H_BEFORE,
      ];

      for (const reminderType of consentReminderTypes) {
        await this.processConsentRemindersForType(reminderType);
      }
    } catch (error) {
      this.logger.error('Error in consent reminders check:', error);
    }
  }

  /**
   * Run every hour to check for post-appointment reminders
   */
  @Cron(CronExpression.EVERY_HOUR)
  async checkPostAppointmentReminders() {
    this.logger.log('Running post-appointment reminders check...');

    try {
      // Check for review requests
      await this.processReviewReminders();

      // Check for photo requests
      await this.processPhotoReminders();
    } catch (error) {
      this.logger.error('Error in post-appointment reminders check:', error);
    }
  }

  private async processRemindersForType(reminderType: ReminderType) {
    const { startTime, endTime } =
      this.reminderCalculationService.getSQLTimestampsForReminder(reminderType);

    const events = await this.agendaEventRepository.findEventsForReminder(
      startTime,
      endTime,
      [AgendaEventStatus.CONFIRMED, AgendaEventStatus.RESCHEDULED],
    );

    this.logger.log(
      `Found ${events.length} events for ${reminderType} reminders`,
    );

    for (const event of events) {
      // Check if this reminder was already sent
      if (event.reminderSent && event.reminderSent[reminderType]) {
        this.logger.debug(
          `Reminder ${reminderType} already sent for event ${event.id}`,
        );
        continue;
      }

      await this.sendAppointmentReminder(event, reminderType);
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

  private async processConsentRemindersForType(reminderType: ReminderType) {
    const { startTime, endTime } =
      this.reminderCalculationService.getSQLTimestampsForReminder(reminderType);

    const events =
      await this.agendaEventRepository.findEventsNeedingConsentReminder(
        startTime,
        endTime,
      );

    this.logger.log(
      `Found ${events.length} events needing ${reminderType} consent reminders`,
    );

    for (const event of events) {
      await this.sendConsentReminder(event, reminderType);
    }
  }

  private async processReviewReminders() {
    // 24 hours after
    const twentyFourHoursAgo =
      this.reminderCalculationService.getSQLTimestampsForReminder(
        ReminderType.REVIEW_REQUEST_24H_AFTER,
      );

    const events24h =
      await this.agendaEventRepository.findCompletedEventsForReview(
        twentyFourHoursAgo.startTime,
        twentyFourHoursAgo.endTime,
      );

    // 48 hours after
    const fortyEightHoursAgo =
      this.reminderCalculationService.getSQLTimestampsForReminder(
        ReminderType.REVIEW_REQUEST_48H_AFTER,
      );

    const events48h =
      await this.agendaEventRepository.findCompletedEventsForReview(
        fortyEightHoursAgo.startTime,
        fortyEightHoursAgo.endTime,
      );

    for (const event of events24h) {
      await this.sendReviewReminder(
        event,
        ReminderType.REVIEW_REQUEST_24H_AFTER,
      );
    }

    for (const event of events48h) {
      await this.sendReviewReminder(
        event,
        ReminderType.REVIEW_REQUEST_48H_AFTER,
      );
    }
  }

  private async processPhotoReminders() {
    const immediately =
      this.reminderCalculationService.getSQLTimestampsForReminder(
        ReminderType.PHOTO_REQUEST_IMMEDIATELY,
      );

    const events = await this.agendaEventRepository.findEventsNeedingPhotos(
      immediately.startTime,
      immediately.endTime,
    );

    for (const event of events) {
      await this.sendPhotoReminder(
        event,
        ReminderType.PHOTO_REQUEST_IMMEDIATELY,
      );
    }
  }

  private async sendAppointmentReminder(
    event: any,
    reminderType: ReminderType,
  ) {
    try {
      // Add job to notification queue
      await this.notificationQueue.add('APPOINTMENT_REMINDER', {
        jobId: 'APPOINTMENT_REMINDER',
        notificationTypeId: 'EMAIL_AND_PUSH',
        metadata: {
          customerId: event.customerId,
          eventId: event.id,
          artistId: event.artistId,
          reminderType,
          appointmentDate: event.startDate,
          eventTitle: event.title,
        },
      });

      this.logger.log(`Queued ${reminderType} reminder for event ${event.id}`);
    } catch (error) {
      this.logger.error(
        `Failed to queue ${reminderType} reminder for event ${event.id}:`,
        error,
      );
    }
  }

  private async sendConsentReminder(event: any, reminderType: ReminderType) {
    try {
      const jobData = {
        jobId: 'CONSENT_REMINDER',
        notificationTypeId: 'EMAIL_AND_PUSH',
        metadata: {
          eventId: event.id,
          customerId: event.customerId,
          artistId: event.agenda.artistId,
          reminderType,
          appointmentDate: event.startDate,
        },
      };

      await this.notificationQueue.add(jobData);
      this.logger.log(
        `Queued ${reminderType} consent reminder for event ${event.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Error sending consent reminder for event ${event.id}:`,
        error,
      );
    }
  }

  private async sendReviewReminder(event: any, reminderType: ReminderType) {
    try {
      const jobData = {
        jobId: 'REVIEW_REMINDER',
        notificationTypeId: 'EMAIL_AND_PUSH',
        metadata: {
          eventId: event.id,
          customerId: event.customerId,
          artistId: event.agenda.artistId,
          reminderType,
        },
      };

      await this.notificationQueue.add(jobData);
      this.logger.log(
        `Queued ${reminderType} review reminder for event ${event.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Error sending review reminder for event ${event.id}:`,
        error,
      );
    }
  }

  private async sendPhotoReminder(event: any, reminderType: ReminderType) {
    try {
      const jobData = {
        jobId: 'PHOTO_UPLOAD_REMINDER',
        notificationTypeId: 'PUSH',
        metadata: {
          eventId: event.id,
          artistId: event.agenda.artistId,
          customerId: event.customerId,
          reminderType,
        },
      };

      await this.notificationQueue.add(jobData);
      this.logger.log(
        `Queued ${reminderType} photo reminder for event ${event.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Error sending photo reminder for event ${event.id}:`,
        error,
      );
    }
  }
}
