import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiHeader,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AuthGuard } from '../global/infrastructure/guards/auth.guard';

import { NotificationQueryDto } from './dtos/notification-query.dto';
import { PaginatedNotificationsResponseDto } from './dtos/notification-response.dto';
import { NotificationsHandler } from './notifications.handler';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(AuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsHandler: NotificationsHandler) {}

  @ApiOperation({ summary: 'Get all notifications for the current user' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, example: 'EVENT_STATUS_CHANGED' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
    required: true,
  })
  @ApiOkResponse({
    description: 'List of notifications with pagination',
    type: PaginatedNotificationsResponseDto,
  })
  @Get()
  async getNotifications(
    @Query() query: NotificationQueryDto,
  ): Promise<PaginatedNotificationsResponseDto> {
    return this.notificationsHandler.getNotifications(query);
  }

  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiParam({ name: 'id', required: true, type: String })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
    required: true,
  })
  @ApiNoContentResponse({ description: 'Notification marked as read' })
  @HttpCode(204)
  @Put(':id/read')
  async markAsRead(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.notificationsHandler.markNotificationAsRead(id);
  }

  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
    required: true,
  })
  @ApiNoContentResponse({ description: 'All notifications marked as read' })
  @HttpCode(204)
  @Put('read-all')
  async markAllAsRead(): Promise<void> {
    await this.notificationsHandler.markAllNotificationsAsRead();
  }

  @ApiOperation({ summary: 'Delete a notification' })
  @ApiParam({ name: 'id', required: true, type: String })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
    required: true,
  })
  @ApiNoContentResponse({ description: 'Notification deleted' })
  @HttpCode(204)
  @Delete(':id')
  async deleteNotification(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.notificationsHandler.deleteNotification(id);
  }
}
