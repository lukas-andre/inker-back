import { Injectable } from '@nestjs/common';
import { BaseUseCase, UseCase } from '../../global/domain/usecases/base.usecase';
import { NotificationRepository } from '../database/notification.repository';

@Injectable()
export class MarkAllNotificationsReadUsecase extends BaseUseCase implements UseCase {
  constructor(private readonly notificationRepository: NotificationRepository) {
    super(MarkAllNotificationsReadUsecase.name);
  }

  async execute(userId: number): Promise<void> {
    await this.notificationRepository.markAllNotificationsAsRead(userId);
  }
}