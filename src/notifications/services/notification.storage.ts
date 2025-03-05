import { Injectable } from '@nestjs/common';
import { JobTypeKey } from '../../queues/notifications/domain/jobSchema.registry';
import { NotificationRepository } from '../database/notification.repository';
import { Notification } from '../database/entities/notification.entity';

@Injectable()
export class NotificationStorageService {
  constructor(private readonly notificationRepository: NotificationRepository) {}

  /**
   * Store a notification in the database
   * @param userId The ID of the user who will receive the notification
   * @param title The notification title
   * @param body The notification body/message
   * @param type The notification type from JobTypeKey
   * @param data Additional metadata for the notification
   * @returns The created notification
   */
  async storeNotification(
    userId: number,
    title: string,
    body: string,
    type: JobTypeKey,
    data: Record<string, any> = {},
  ): Promise<Notification> {
    return await this.notificationRepository.createNotification({
      userId,
      title,
      body,
      type,
      data,
      read: false,
    });
  }
}