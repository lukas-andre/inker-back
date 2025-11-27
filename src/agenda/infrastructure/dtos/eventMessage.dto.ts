import { ApiProperty } from '@nestjs/swagger';

export class EventMessageDto {
  @ApiProperty({
    description: 'ID of the message',
    example: 'message-uuid-123',
  })
  id: string;

  @ApiProperty({ description: 'ID of the event', example: 'event-uuid-123' })
  eventId: string;

  @ApiProperty({
    description: 'ID of the sender (artist or customer)',
    example: 'user-uuid-123',
  })
  senderId: string;

  @ApiProperty({
    description: "Type of the sender, either 'artist' or 'customer'",
    example: 'artist',
    enum: ['artist', 'customer'],
  })
  senderType: 'artist' | 'customer';

  @ApiProperty({
    description: 'Content of the message',
    example: 'See you at the appointment!',
  })
  message: string;

  @ApiProperty({
    description: 'Optional URL for an image sent with the message',
    example: 'https://example.com/image.jpg',
    required: false,
  })
  imageUrl?: string;

  @ApiProperty({
    description: 'Timestamp when the message was sent',
    example: '2023-10-27T10:00:00.000Z',
  })
  createdAt: Date;
}
