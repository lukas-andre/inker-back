import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { StencilStatus } from '../stencilType';

export class StencilQueryDto {
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
    description: 'Filtrar por estado del estencil',
    enum: StencilStatus
  })
  @IsOptional()
  @IsEnum(StencilStatus)
  status?: StencilStatus;

  @ApiPropertyOptional({ 
    description: 'Incluir estenciles ocultos en los resultados',
    default: false
  })
  @IsOptional()
  @Type(() => Boolean)
  includeHidden?: boolean;
} 