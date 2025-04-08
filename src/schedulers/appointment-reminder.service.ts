import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AgendaEventRepository } from '../agenda/infrastructure/repositories/agendaEvent.repository';
import { AgendaEvent } from '../agenda/infrastructure/entities/agendaEvent.entity';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { queues } from '../queues/queues';
import { Between } from 'typeorm';
import { AgendaEventStatus } from '../agenda/domain/enum/agendaEventStatus.enum';

@Injectable()
export class AppointmentReminderService {
  private readonly logger = new Logger(AppointmentReminderService.name);

  constructor(
    private readonly agendaEventProvider: AgendaEventRepository,
    @InjectQueue(queues.notification.name) private notificationQueue: Queue,
  ) { }

  /**
   * Run every day at 10:00 AM to check for appointments happening the next day
   * and send reminders to customers
   */
  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async sendDayBeforeReminders() {
    this.logger.log('Running daily appointment reminders check...');

    // Calculate tomorrow's date range (start of day to end of day)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(23, 59, 59, 999);

    await this.processAppointmentReminders(tomorrow, tomorrowEnd, '24-hours');
  }

  /**
   * Run every hour to check for appointments happening in the next 3 hours
   * and send reminders to customers
   */
  @Cron(CronExpression.EVERY_HOUR)
  async sendThreeHourReminders() {
    this.logger.log('Running 3-hour appointment reminders check...');

    // Calculate the next 3 hours time range
    const now = new Date();
    const threeHoursFromNow = new Date();
    threeHoursFromNow.setHours(now.getHours() + 3);

    await this.processAppointmentReminders(now, threeHoursFromNow, '3-hours');
  }

  /**
   * Process appointment reminders for a specific time range
   * @param startDate Start date for the reminder range
   * @param endDate End date for the reminder range
   * @param reminderType Type of reminder (e.g., '24-hours', '3-hours')
   */
  private async processAppointmentReminders(startDate: Date, endDate: Date, reminderType: string) {
    try {
      // Find all scheduled appointments happening in the specified time range
      const upcomingEvents = await this.agendaEventProvider.find({
        where: {
          startDate: Between(startDate, endDate),
          status: AgendaEventStatus.SCHEDULED,
        },
        relations: ['agenda'],
      });

      this.logger.log(`Found ${upcomingEvents.length} appointments for ${reminderType} reminders`);

      // Send reminders for each appointment
      for (const event of upcomingEvents) {
        await this.sendReminderNotification(event, reminderType);
      }
    } catch (error) {
      this.logger.error(`Error processing ${reminderType} reminders:`, error);
    }
  }

  /**
   * Queue a reminder notification for an appointment
   * @param event The agenda event to send a reminder for
   * @param reminderType Type of reminder (e.g., '24-hours', '3-hours')
   */
  private async sendReminderNotification(event: AgendaEvent, reminderType: string) {
    try {
      const agenda = event.agenda;
      const artistId = agenda.artistId;
      const customerId = event.customerId;

      // Skip if we're missing required data
      if (!artistId || !customerId) {
        this.logger.warn(`Missing artist or customer ID for event ${event.id}, skipping reminder`);
        return;
      }

      // Create the reminder job data
      const reminderJob = {
        jobId: 'EVENT_REMINDER',
        metadata: {
          eventId: event.id,
          artistId,
          customerId,
          reminderType,
        },
      };

      // Queue the reminder job
      await this.notificationQueue.add(reminderJob, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 60000, // 1 minute
        },
        removeOnComplete: true,
      });

      this.logger.log(`Queued ${reminderType} reminder for event ${event.id} (Customer ${customerId}, Artist ${artistId})`);
    } catch (error) {
      this.logger.error(`Error sending reminder for event ${event.id}:`, error);
    }
  }
}