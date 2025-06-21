import { Injectable, NotFoundException } from '@nestjs/common';

import {
  BaseUseCase,
  UseCase,
} from '../../global/domain/usecases/base.usecase';
import { NotificationRepository } from '../database/notification.repository';

@Injectable()
export class DeleteNotificationUsecase extends BaseUseCase implements UseCase {
  constructor(private readonly notificationRepository: NotificationRepository) {
    super(DeleteNotificationUsecase.name);
  }

  async execute(id: string, userId: string): Promise<void> {
    // Check if notification exists and belongs to the user
    const notification = await this.notificationRepository.findNotificationById(
      id,
    );

    if (!notification || notification.userId !== userId) {
      throw new NotFoundException('Notification not found');
    }

    // Delete notification
    await this.notificationRepository.deleteNotification(id);
  }
}
