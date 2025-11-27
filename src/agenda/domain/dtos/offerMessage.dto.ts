import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// DTO representation of OfferMessage for Swagger
export class OfferMessageDto {
  @ApiProperty()
  senderId: string;

  @ApiProperty({ enum: ['customer', 'artist'] })
  senderType: 'customer' | 'artist';

  @ApiProperty()
  message: string;

  @ApiPropertyOptional()
  imageUrl?: string;

  @ApiProperty()
  metadata?: Record<string, any>;

  @ApiProperty()
  timestamp: Date;
}
