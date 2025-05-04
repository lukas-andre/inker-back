import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { MoneyDto } from '../../../global/domain/dtos/money.dto';

export class UpdateOpenQuotationReqDto {
  @ApiPropertyOptional({ type: MoneyDto, description: 'Presupuesto mínimo sugerido' })
  @IsOptional()
  @ValidateNested()
  @Type(() => MoneyDto)
  minBudget?: MoneyDto;

  @ApiPropertyOptional({ type: MoneyDto, description: 'Presupuesto máximo sugerido' })
  @IsOptional()
  @ValidateNested()
  @Type(() => MoneyDto)
  maxBudget?: MoneyDto;

  @ApiPropertyOptional({ type: MoneyDto, description: 'Presupuesto de referencia (si no hay rango)' })
  @IsOptional()
  @ValidateNested()
  @Type(() => MoneyDto)
  referenceBudget?: MoneyDto;

  @ApiPropertyOptional({ description: 'Descripción actualizada de la cotización' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'ID de la imagen generada (ya subida)' })
  @IsOptional()
  @IsString()
  generatedImageId?: string;
} 