import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class SendOfferMessageReqDto {
  @ApiProperty({ description: 'Message text content', maxLength: 1000 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  message: string;

  // Image upload will be handled via multipart/form-data, not directly in this DTO field
  // We might include a reference to the uploaded file ID later if needed, but keep it simple for now
  // @ApiPropertyOptional({ description: 'Optional ID of an uploaded image file' })
  // @IsOptional()
  // @IsString()
  // imageId?: string;
} 