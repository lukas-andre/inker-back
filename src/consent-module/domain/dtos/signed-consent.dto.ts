import { ApiProperty } from '@nestjs/swagger';

export class SignedConsentDto {
  @ApiProperty({ description: 'Unique identifier of the signed consent', example: 'e5f6a7b8-c9d0-1234-5678-90abcdef0123' })
  id: string;

  @ApiProperty({ description: 'Event ID associated with this consent', example: 'c3d4e5f6-a7b8-9012-3456-7890abcdef01' })
  eventId: string;

  @ApiProperty({ description: 'Form Template ID used for signing (if any)', example: 'd4e5f6a7-b8c9-0123-4567-890abcdef012', required: false })
  formTemplateId?: string;

  @ApiProperty({ description: 'The actual data signed by the user' })
  signedData: Record<string, any>;

  @ApiProperty({ description: 'Digital signature data' })
  digitalSignature: string;

  @ApiProperty({ description: 'Timestamp of when the consent was signed', example: '2023-01-01T14:00:00.000Z' })
  signedAt: Date;

  @ApiProperty({ description: 'User ID of the person who signed', example: 'f6a7b8c9-d0e1-2345-6789-0abcdef01234' })
  userId: string;

  @ApiProperty({ description: 'IP address at the time of signing', required: false, example: '192.168.1.100' })
  ipAddress?: string;

  @ApiProperty({ description: 'User agent at the time of signing', required: false, example: 'Mozilla/5.0...' })
  userAgent?: string;
} 