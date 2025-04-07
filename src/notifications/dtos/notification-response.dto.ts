import { ApiProperty } from '@nestjs/swagger';
import { JobTypeKey } from '../../queues/notifications/domain/jobSchema.registry';

export class NotificationResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6' })
  id: string;

  @ApiProperty({ example: 'Your appointment status has changed' })
  title: string;

  @ApiProperty({ example: 'Your appointment has been confirmed' })
  body: string;

  @ApiProperty({ 
    example: 'EVENT_STATUS_CHANGED',
    enum: ['EVENT_CREATED', 'EVENT_UPDATED', 'EVENT_CANCELED', 'EVENT_STATUS_CHANGED']
  })
  type: JobTypeKey;

  @ApiProperty({ 
    example: { 
      eventId: 123, 
      status: 'confirmed',
      artistId: 456
    } 
  })
  data: Record<string, any>;

  @ApiProperty({ example: false })
  read: boolean;

  @ApiProperty({ example: '2023-01-01T12:00:00Z' })
  createdAt: Date;
}

export class PaginatedNotificationsResponseDto {
  @ApiProperty({ type: [NotificationResponseDto] })
  items: NotificationResponseDto[];

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 50 })
  total: number;

  @ApiProperty({ example: 5 })
  pages: number;

  @ApiProperty({ example: 8 })
  unreadCount: number;
}