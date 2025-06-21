import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

import { WorkSource } from '../workType';

export class WorkQueryDto {
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

  @ApiPropertyOptional({
    description: 'Mostrar solo trabajos destacados',
    default: undefined,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isFeatured?: boolean;

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
    description: 'Incluir métricas (vistas y likes) en los resultados',
    default: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  includeMetrics?: boolean = true;
}
