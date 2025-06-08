import { ApiProperty } from '@nestjs/swagger';

export class CheckConsentStatusDto {
  @ApiProperty({ description: 'Event ID to check consent status for', example: 'c3d4e5f6-a7b8-9012-3456-7890abcdef01' })
  eventId: string;

  @ApiProperty({ description: 'Whether the customer has signed consent for this event' })
  hasSigned: boolean;

  @ApiProperty({ description: 'Date when consent was signed (if applicable)', required: false })
  signedAt?: string;

  @ApiProperty({ description: 'Template used for signing (if applicable)', required: false })
  templateTitle?: string;
} 