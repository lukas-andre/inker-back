import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import { QuotationStatus, QuotationType } from '../entities/quotation.entity';

export class GetQuotationsQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by quotation status (comma-separated)',
    example: 'PENDING,APPROVED',
  })
  @IsOptional()
  @IsString()
  readonly status?: string;

  @ApiPropertyOptional({
    description: 'Filter by quotation type',
    enum: QuotationType,
  })
  @IsOptional()
  @IsEnum(QuotationType)
  readonly type?: QuotationType;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    default: 1,
    type: Number,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  @IsNumber()
  @Min(1)
  readonly page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    default: 10,
    type: Number,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  @IsNumber()
  @Min(1)
  readonly limit?: number = 10;
}
