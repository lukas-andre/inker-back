import { Injectable } from '@nestjs/common';
import { BaseUseCase, UseCase } from '../../global/domain/usecases/base.usecase';
import { NotificationRepository } from '../database/notification.repository';
import { NotificationQueryDto } from '../dtos/notification-query.dto';
import { PaginatedNotificationsResponseDto } from '../dtos/notification-response.dto';

@Injectable()
export class GetNotificationsUsecase extends BaseUseCase implements UseCase {
  constructor(private readonly notificationRepository: NotificationRepository) {
    super(GetNotificationsUsecase.name);
  }

  async execute(
    userId: number,
    query: NotificationQueryDto,
  ): Promise<PaginatedNotificationsResponseDto> {
    const { page = 1, limit = 10, type } = query;
    
    // Create the where condition based on the query
    const where: any = { userId };
    if (type) {
      where.type = type;
    }
    
    // Get notifications with pagination
    const [notifications, total] = await this.notificationRepository.findNotificationsByUserId(
      userId,
      page,
      limit,
    );
    
    // Count unread notifications
    const unreadCount = await this.notificationRepository.countUnreadNotificationsByUserId(userId);
    
    // Calculate total pages
    const pages = Math.ceil(total / limit);
    
    return {
      items: notifications,
      page,
      limit,
      total,
      pages,
      unreadCount,
    };
  }
}