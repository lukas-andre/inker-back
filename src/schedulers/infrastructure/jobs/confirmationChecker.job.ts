import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Queue } from 'bull';

import { AgendaEventStatus } from '../../../agenda/domain/enum/agendaEventStatus.enum';
import {
  AgendaEventTransition,
  EventStateMachineService,
} from '../../../agenda/domain/services/eventStateMachine.service';
import { AgendaEventRepository } from '../../../agenda/infrastructure/repositories/agendaEvent.repository';
import { BaseComponent } from '../../../global/domain/components/base.component';
import { queues } from '../../../queues/queues';
import { UserType } from '../../../users/domain/enums/userType.enum';

@Injectable()
export class ConfirmationCheckerJob extends BaseComponent {
  constructor(
    private readonly agendaEventRepository: AgendaEventRepository,
    private readonly eventStateMachineService: EventStateMachineService,
    @InjectQueue(queues.notification.name)
    private readonly notificationQueue: Queue,
  ) {
    super(ConfirmationCheckerJob.name);
  }

  /**
   * Check for pending confirmations every hour
   */
  @Cron('0 * * * *')
  async checkPendingConfirmations() {
    this.logger.log('Starting pending confirmations check...');

    try {
      await Promise.all([
        this.sendConfirmationReminders(),
        this.autoCancelExpiredEvents(),
      ]);

      this.logger.log('Pending confirmations check completed');
    } catch (error) {
      this.logger.error('Error checking pending confirmations:', error);
    }
  }

  /**
   * Send reminders for events requiring confirmation
   */
  private async sendConfirmationReminders() {
    // Find events in PENDING_CONFIRMATION status
    const pendingEvents = await this.agendaEventRepository.findEventsByStatus([
      AgendaEventStatus.PENDING_CONFIRMATION,
      AgendaEventStatus.CREATED,
    ]);

    for (const event of pendingEvents) {
      const hoursRemaining = this.calculateHoursUntilExpiration(
        event.createdAt,
      );

      // Send reminder if within 48 hours and not expired
      if (hoursRemaining > 0 && hoursRemaining <= 48) {
        await this.sendConfirmationReminder(event, hoursRemaining);
      }
    }

    this.logger.log(
      `Processed ${pendingEvents.length} events for confirmation reminders`,
    );
  }

  /**
   * Auto-cancel events that have been pending for more than 48 hours
   */
  private async autoCancelExpiredEvents() {
    const expiredEvents =
      await this.agendaEventRepository.findExpiredPendingEvents();

    for (const event of expiredEvents) {
      try {
        // Transition to canceled
        await this.eventStateMachineService.transition(
          event.status, // current state
          AgendaEventTransition.CANCEL, // transition event
          {
            eventEntity: event,
            actor: {
              userId: 'system',
              roleId: 'system',
              role: UserType.SYSTEM as any,
            },
            payload: {
              reason: 'Auto-canceled: No confirmation received within 48 hours',
            },
          },
        );

        // Send auto-cancellation notification
        await this.sendAutoCancellationNotification(
          event,
          'NO_CONFIRMATION_48H',
        );

        this.logger.log(`Auto-canceled expired event ${event.id}`);
      } catch (error) {
        this.logger.error(`Failed to auto-cancel event ${event.id}:`, error);
      }
    }

    this.logger.log(`Auto-canceled ${expiredEvents.length} expired events`);
  }

  private async sendConfirmationReminder(event: any, hoursRemaining: number) {
    try {
      await this.notificationQueue.add('CONFIRMATION_REMINDER', {
        jobId: 'CONFIRMATION_REMINDER',
        notificationTypeId: 'EMAIL_AND_PUSH',
        metadata: {
          customerId: event.customerId,
          eventId: event.id,
          artistId: event.artistId,
          hoursRemaining: Math.floor(hoursRemaining),
        },
      });

      this.logger.debug(
        `Queued confirmation reminder for event ${event.id}, ${hoursRemaining}h remaining`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to queue confirmation reminder for event ${event.id}:`,
        error,
      );
    }
  }

  private async sendAutoCancellationNotification(event: any, reason: string) {
    try {
      await this.notificationQueue.add('EVENT_AUTO_CANCELED', {
        jobId: 'EVENT_AUTO_CANCELED',
        notificationTypeId: 'EMAIL_AND_PUSH',
        metadata: {
          customerId: event.customerId,
          eventId: event.id,
          artistId: event.artistId,
          reason,
        },
      });

      this.logger.debug(
        `Queued auto-cancellation notification for event ${event.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to queue auto-cancellation notification for event ${event.id}:`,
        error,
      );
    }
  }

  private calculateHoursUntilExpiration(createdAt: Date): number {
    const now = new Date();
    const expirationTime = new Date(createdAt.getTime() + 48 * 60 * 60 * 1000); // 48 hours after creation
    return Math.max(
      0,
      (expirationTime.getTime() - now.getTime()) / (1000 * 60 * 60),
    );
  }
}
