import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

import { StencilStatus } from '../stencilType';

export class StencilSearchQueryDto {
  @ApiPropertyOptional({
    description:
      'Término de búsqueda en texto libre. Se utilizará para buscar coincidencias en títulos, descripciones y etiquetas.',
  })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({
    description: 'IDs de etiquetas para filtrar separadas por coma',
    type: String,
  })
  @IsOptional()
  tagIds?: string;

  @ApiPropertyOptional({ description: 'ID del artista', type: String })
  @IsOptional()
  @IsString()
  artistId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por estado del estencil',
    enum: StencilStatus,
  })
  @IsOptional()
  @IsEnum(StencilStatus)
  status?: StencilStatus;

  @ApiPropertyOptional({
    description: 'Incluir estenciles ocultos en los resultados',
    default: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  includeHidden?: boolean;

  @ApiPropertyOptional({
    description: 'Ordenar por',
    enum: ['relevance', 'newest', 'oldest', 'price_low', 'price_high'],
    default: 'relevance',
  })
  @IsOptional()
  @IsString()
  sortBy?:
    | 'relevance'
    | 'newest'
    | 'oldest'
    | 'price_low'
    | 'price_high'
    | 'relevance';

  @ApiPropertyOptional({ description: 'Página', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Resultados por página', default: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  limit?: number = 10;
}

export class TagSuggestionQueryDto {
  @ApiProperty({ description: 'Prefijo para sugerir etiquetas' })
  @IsNotEmpty()
  @IsString()
  prefix: string;

  @ApiPropertyOptional({
    description: 'Número máximo de sugerencias',
    default: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;
}

export class TagSuggestionResponseDto {
  @ApiProperty({ description: 'ID de la etiqueta' })
  id: string;

  @ApiProperty({ description: 'Nombre de la etiqueta' })
  name: string;

  @ApiPropertyOptional({
    description: 'Número de estenciles con esta etiqueta',
  })
  count?: number;
}
