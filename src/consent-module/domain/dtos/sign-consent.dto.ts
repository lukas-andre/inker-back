import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsObject, IsUUID, IsOptional, IsIP, MaxLength } from 'class-validator';

export class SignConsentDto {
  @ApiProperty({ description: 'Event ID for which the consent is being signed', example: 'c3d4e5f6-a7b8-9012-3456-7890abcdef01' })
  @IsUUID()
  @IsNotEmpty()
  eventId: string;

  @ApiProperty({ description: 'Form Template ID used for signing (optional, if a specific template is used)', example: 'd4e5f6a7-b8c9-0123-4567-890abcdef012', required: false })
  @IsOptional()
  @IsUUID()
  formTemplateId?: string;

  @ApiProperty({ description: 'JSON object containing the signed data based on the form template or ad-hoc structure', example: { clientName: "John Doe", agreedToTerms: true } })
  @IsObject()
  @IsNotEmpty()
  signedData: Record<string, any>;

  @ApiProperty({ description: 'Digital signature data (e.g., base64 encoded image or a confirmation string)', example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg....' })
  @IsString()
  @IsNotEmpty()
  digitalSignature: string;

  // userId will be extracted from the authenticated user (e.g., JWT token) in the use case/service, not passed in DTO.

  @ApiProperty({ description: 'IP address of the user signing the consent (optional)', example: '192.168.1.100', required: false })
  @IsOptional()
  @IsIP()
  ipAddress?: string;

  @ApiProperty({ description: 'User agent of the client device (optional)', example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  userAgent?: string;
} 