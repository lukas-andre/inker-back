import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

import { WorkSource } from '../workType';

export class WorkSearchQueryDto {
  @ApiPropertyOptional({
    description:
      'Término de búsqueda en texto libre. Se utilizará para buscar coincidencias en títulos, descripciones y etiquetas. Para búsquedas más precisas, utilice comillas ("") alrededor de frases exactas.',
  })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({
    description: 'IDs de etiquetas para filtrar separadas por coma',
    type: String,
  })
  @IsOptional()
  @IsString()
  tagIds?: string;

  @ApiPropertyOptional({ description: 'ID del artista', type: String })
  @IsOptional()
  @IsString()
  artistId?: string;

  @ApiPropertyOptional({
    description: 'Mostrar solo trabajos destacados',
    default: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  onlyFeatured?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrar por origen del trabajo (APP o EXTERNAL)',
    enum: WorkSource,
  })
  @IsOptional()
  @IsEnum(WorkSource)
  source?: WorkSource;

  @ApiPropertyOptional({
    description: 'Incluir trabajos ocultos en los resultados',
    default: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  includeHidden?: boolean;

  @ApiPropertyOptional({
    description: `Ordenar por: 
    - relevance: Utiliza un algoritmo inteligente que considera coincidencias en título, descripción, popularidad y fecha de creación.
    - newest: Ordena por fecha de creación más reciente.
    - oldest: Ordena por fecha de creación más antigua.
    - popularity: Ordena por número de visualizaciones.
    - position: Ordena por la posición asignada al trabajo.
    Para más información sobre cómo funciona el algoritmo de relevancia, consulte el endpoint /work-search/ranking-info.`,
    enum: ['relevance', 'newest', 'oldest', 'popularity', 'position'],
    default: 'relevance',
  })
  @IsOptional()
  @IsString()
  sortBy?: 'relevance' | 'newest' | 'oldest' | 'popularity' | 'position' =
    'relevance';

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

export class WorkTagSuggestionQueryDto {
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

export class WorkTagSuggestionResponseDto {
  @ApiProperty({ description: 'ID de la etiqueta' })
  id: string;

  @ApiProperty({ description: 'Nombre de la etiqueta' })
  name: string;

  @ApiPropertyOptional({ description: 'Número de trabajos con esta etiqueta' })
  count?: number;
}
