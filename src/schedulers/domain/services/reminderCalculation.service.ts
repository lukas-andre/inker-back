import { Injectable } from '@nestjs/common';
import { AgendaEvent } from '../../../agenda/infrastructure/entities/agendaEvent.entity';
import { ReminderType } from '../enums/reminderType.enum';

@Injectable()
export class ReminderCalculationService {
  /**
   * Calculate if an event needs a specific reminder type based on current time
   */
  shouldSendReminder(event: AgendaEvent, reminderType: ReminderType): boolean {
    const now = new Date();
    const eventDate = new Date(event.startDate);
    const hoursUntilEvent = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    const hoursAfterEvent = (now.getTime() - eventDate.getTime()) / (1000 * 60 * 60);

    switch (reminderType) {
      case ReminderType.APPOINTMENT_24H_BEFORE:
        return hoursUntilEvent >= 23.5 && hoursUntilEvent <= 24.5;
      
      case ReminderType.APPOINTMENT_2H_BEFORE:
        return hoursUntilEvent >= 1.5 && hoursUntilEvent <= 2.5;
      
      case ReminderType.APPOINTMENT_30MIN_BEFORE:
        return hoursUntilEvent >= 0.4 && hoursUntilEvent <= 0.6;
      
      case ReminderType.REVIEW_REQUEST_24H_AFTER:
        return hoursAfterEvent >= 23.5 && hoursAfterEvent <= 24.5;
      
      case ReminderType.REVIEW_REQUEST_48H_AFTER:
        return hoursAfterEvent >= 47.5 && hoursAfterEvent <= 48.5;
      
      case ReminderType.PHOTO_REQUEST_IMMEDIATELY:
        return hoursAfterEvent >= 0 && hoursAfterEvent <= 0.5;
      
      case ReminderType.CONSENT_12H_BEFORE:
        return hoursUntilEvent >= 11.5 && hoursUntilEvent <= 12.5;
      
      case ReminderType.CONSENT_2H_BEFORE:
        return hoursUntilEvent >= 1.5 && hoursUntilEvent <= 2.5;
      
      default:
        return false;
    }
  }

  /**
   * Get events that are in a specific time window
   */
  getTimeWindowForReminder(reminderType: ReminderType): { startOffset: number; endOffset: number } {
    // Returns hours from now (negative for past, positive for future)
    switch (reminderType) {
      case ReminderType.APPOINTMENT_24H_BEFORE:
        return { startOffset: 23.5, endOffset: 24.5 };
      
      case ReminderType.APPOINTMENT_2H_BEFORE:
        return { startOffset: 1.5, endOffset: 2.5 };
      
      case ReminderType.APPOINTMENT_30MIN_BEFORE:
        return { startOffset: 0.4, endOffset: 0.6 };
      
      case ReminderType.REVIEW_REQUEST_24H_AFTER:
        return { startOffset: -24.5, endOffset: -23.5 };
      
      case ReminderType.REVIEW_REQUEST_48H_AFTER:
        return { startOffset: -48.5, endOffset: -47.5 };
      
      case ReminderType.PHOTO_REQUEST_IMMEDIATELY:
        return { startOffset: -0.5, endOffset: 0 };
      
      case ReminderType.CONSENT_12H_BEFORE:
        return { startOffset: 11.5, endOffset: 12.5 };
      
      case ReminderType.CONSENT_2H_BEFORE:
        return { startOffset: 1.5, endOffset: 2.5 };
      
      default:
        return { startOffset: 0, endOffset: 0 };
    }
  }

  /**
   * Get SQL timestamp window for reminder checking
   */
  getSQLTimestampsForReminder(reminderType: ReminderType): { startTime: string; endTime: string } {
    const now = new Date();
    let targetTime: Date;
    let windowMinutes = 30; // Default window of 30 minutes

    switch (reminderType) {
      case ReminderType.APPOINTMENT_24H_BEFORE:
        targetTime = new Date(now.getTime() + (24 * 60 * 60 * 1000)); // 24 hours from now
        windowMinutes = 30; // 30-minute window
        break;
        
      case ReminderType.APPOINTMENT_2H_BEFORE:
        targetTime = new Date(now.getTime() + (2 * 60 * 60 * 1000)); // 2 hours from now
        windowMinutes = 15; // 15-minute window
        break;
        
      case ReminderType.APPOINTMENT_30MIN_BEFORE:
        targetTime = new Date(now.getTime() + (30 * 60 * 1000)); // 30 minutes from now
        windowMinutes = 10; // 10-minute window
        break;

      case ReminderType.CONSENT_12H_BEFORE:
        targetTime = new Date(now.getTime() + (12 * 60 * 60 * 1000)); // 12 hours from now
        windowMinutes = 30;
        break;

      case ReminderType.CONSENT_2H_BEFORE:
        targetTime = new Date(now.getTime() + (2 * 60 * 60 * 1000)); // 2 hours from now
        windowMinutes = 15;
        break;

      case ReminderType.REVIEW_REQUEST_24H_AFTER:
        targetTime = new Date(now.getTime() - (24 * 60 * 60 * 1000)); // 24 hours ago
        windowMinutes = 60; // 1-hour window
        break;

      case ReminderType.REVIEW_REQUEST_48H_AFTER:
        targetTime = new Date(now.getTime() - (48 * 60 * 60 * 1000)); // 48 hours ago
        windowMinutes = 60; // 1-hour window
        break;

      default:
        throw new Error(`Unsupported reminder type: ${reminderType}`);
    }

    const startTime = new Date(targetTime.getTime() - (windowMinutes * 60 * 1000 / 2));
    const endTime = new Date(targetTime.getTime() + (windowMinutes * 60 * 1000 / 2));

    return {
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
    };
  }

  /**
   * Calculate if we should check for confirmation reminders
   */
  getConfirmationReminderHours(eventDate: Date): number {
    const now = new Date();
    const hoursUntilEvent = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    // Return remaining hours for confirmation window (48 hours)
    return Math.max(0, hoursUntilEvent);
  }
} 