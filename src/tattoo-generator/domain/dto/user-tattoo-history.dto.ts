import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsDate, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
import { TattooStyle } from '../enums/tattooStyle.enum';

export class UserTattooDesignDto {
  @ApiProperty({
    description: 'Unique identifier for the tattoo design',
    example: '77da2d99-a6d3-44d9-b8c0-ae9fb06b6200',
  })
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'The original user query that generated this design',
    example: 'Quiero una mano de Fatima para tatuarme en el antebrazo',
  })
  @IsString()
  userQuery: string;

  @ApiProperty({
    description: 'The style used for this tattoo design',
    enum: TattooStyle,
    example: TattooStyle.TRADITIONAL_AMERICAN,
  })
  @IsString()
  style: string;

  @ApiProperty({
    description: 'URLs of the generated tattoo images',
    example: ['https://example.com/images/tattoo-123.jpg', 'https://example.com/images/tattoo-124.jpg'],
  })
  @IsArray()
  imageUrls: string[];

  @ApiPropertyOptional({
    description: 'Whether this design is marked as favorite',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isFavorite?: boolean;

  @ApiPropertyOptional({
    description: 'Additional metadata about the design',
    example: { timestamp: '2023-05-01T12:00:00Z', totalCost: 0.0039 },
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'When the design was created',
    example: '2023-05-01T12:00:00Z',
  })
  @IsDate()
  @IsOptional()
  createdAt?: Date;
}

export class UserTattooHistoryResponseDto {
  @ApiProperty({
    description: 'List of user tattoo designs',
    type: [UserTattooDesignDto],
  })
  @IsArray()
  designs: UserTattooDesignDto[];

  @ApiPropertyOptional({
    description: 'Total number of designs owned by the user',
    example: 42,
  })
  @IsOptional()
  total?: number;
} 