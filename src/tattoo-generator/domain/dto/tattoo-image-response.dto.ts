import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class TattooImageDto {
  @ApiProperty({
    description: 'URL to the generated tattoo image',
    example: 'https://example.com/images/tattoo-123.jpg',
  })
  @IsString()
  imageUrl: string;

  @ApiProperty({
    description: 'Unique identifier for the generated image',
    example: '77da2d99-a6d3-44d9-b8c0-ae9fb06b6200',
  })
  @IsString()
  imageId: string;

  @ApiProperty({
    description: 'Cost of generating this specific image in USD',
    example: 0.0013,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  cost?: number;

  @ApiPropertyOptional({
    description: 'Whether this image was retrieved from cache',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  fromCache?: boolean;
}

export class TattooImageResponseDto {
  @ApiProperty({
    description: 'List of generated tattoo images',
    type: [TattooImageDto],
  })
  @IsArray()
  images: TattooImageDto[];

  @ApiProperty({
    description: 'Total cost of generating all images in USD',
    example: 0.0039,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  totalCost?: number;

  @ApiPropertyOptional({
    description: 'Whether the images were retrieved from cache',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  fromCache?: boolean;

  @ApiPropertyOptional({
    description: 'Similarity score if results were retrieved from cache',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  similarityScore?: number;

  @ApiPropertyOptional({
    description: 'Remaining token balance after generation',
    example: 23,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  tokenBalance?: number;

  @ApiPropertyOptional({
    description: 'Number of tokens consumed for this generation',
    example: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  tokensConsumed?: number;
}
