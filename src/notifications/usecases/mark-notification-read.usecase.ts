import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseUseCase, UseCase } from '../../global/domain/usecases/base.usecase';
import { NotificationRepository } from '../database/notification.repository';

@Injectable()
export class MarkNotificationReadUsecase extends BaseUseCase implements UseCase {
  constructor(private readonly notificationRepository: NotificationRepository) {
    super(MarkNotificationReadUsecase.name);
  }

  async execute(id: string, userId: number): Promise<void> {
    // Check if notification exists and belongs to the user
    const notification = await this.notificationRepository.findNotificationById(id);
    
    if (!notification || notification.userId !== userId) {
      throw new NotFoundException('Notification not found');
    }
    
    // Mark notification as read
    await this.notificationRepository.markNotificationAsRead(id);
  }
}