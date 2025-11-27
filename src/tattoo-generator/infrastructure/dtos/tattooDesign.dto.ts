import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class GenerateDesignDto {
  @ApiProperty({
    description: 'The user query for the tattoo design',
    example: 'Japanese cat',
  })
  @IsString()
  query: string;

  @ApiPropertyOptional({
    description: 'The desired style of the tattoo',
    example: 'traditional',
  })
  @IsString()
  @IsOptional()
  style?: string;

  @ApiPropertyOptional({
    description: 'The target language for translation',
    example: 'es',
  })
  @IsString()
  @IsOptional()
  targetLanguage?: string;

  @ApiPropertyOptional({
    description: 'Additional prompt instructions',
    example: 'with cherry blossoms',
  })
  @IsString()
  @IsOptional()
  additionalPrompt?: string;
}

export class MarkFavoriteDto {
  @ApiProperty({
    description: 'Whether the design is marked as favorite',
    default: true,
  })
  @IsBoolean()
  isFavorite: boolean;
}

export class TattooDesignResultDto {
  @ApiProperty({ description: 'Unique identifier for the design' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'The original user query' })
  @IsString()
  query: string;

  @ApiPropertyOptional({ description: 'The style of the design' })
  @IsString()
  @IsOptional()
  style?: string;

  @ApiProperty({ description: 'URLs of the generated images', type: [String] })
  @IsArray()
  imageUrls: string[];

  @ApiProperty({ description: 'Whether the result was retrieved from cache' })
  @IsBoolean()
  fromCache: boolean;

  @ApiPropertyOptional({
    description: 'Similarity score if retrieved from cache',
  })
  @IsOptional()
  similarity?: number;

  @ApiPropertyOptional({
    description: 'Translated query if translation was applied',
  })
  @IsString()
  @IsOptional()
  translatedQuery?: string;
}
