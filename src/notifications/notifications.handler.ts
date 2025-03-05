import { Injectable } from '@nestjs/common';
import { NotificationQueryDto } from './dtos/notification-query.dto';
import { PaginatedNotificationsResponseDto } from './dtos/notification-response.dto';
import { DeleteNotificationUsecase } from './usecases/delete-notification.usecase';
import { GetNotificationsUsecase } from './usecases/get-notifications.usecase';
import { MarkAllNotificationsReadUsecase } from './usecases/mark-all-notifications-read.usecase';
import { MarkNotificationReadUsecase } from './usecases/mark-notification-read.usecase';
import { RequestContextService } from '../global/infrastructure/services/requestContext.service';

@Injectable()
export class NotificationsHandler {
  constructor(
    private readonly getNotificationsUsecase: GetNotificationsUsecase,
    private readonly markNotificationReadUsecase: MarkNotificationReadUsecase,
    private readonly markAllNotificationsReadUsecase: MarkAllNotificationsReadUsecase,
    private readonly deleteNotificationUsecase: DeleteNotificationUsecase,
    private readonly requestContext: RequestContextService,
  ) {}

  async getNotifications(
    query: NotificationQueryDto,
  ): Promise<PaginatedNotificationsResponseDto> {
    const { userId } = this.requestContext;
    return this.getNotificationsUsecase.execute(userId, query);
  }

  async markNotificationAsRead(id: string): Promise<void> {
    const { userId } = this.requestContext;
    await this.markNotificationReadUsecase.execute(id, userId);
  }

  async markAllNotificationsAsRead(): Promise<void> {
    const { userId } = this.requestContext;
    await this.markAllNotificationsReadUsecase.execute(userId);
  }

  async deleteNotification(id: string): Promise<void> {
    const { userId } = this.requestContext;
    await this.deleteNotificationUsecase.execute(id, userId);
  }
}