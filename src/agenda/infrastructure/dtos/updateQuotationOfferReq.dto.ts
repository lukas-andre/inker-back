import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsPositive,
  ValidateNested,
} from 'class-validator';

import { MoneyDto } from '../../../global/domain/dtos/money.dto';

export class UpdateQuotationOfferReqDto {
  @ApiProperty({
    description: 'Updated estimated cost',
    required: false,
    type: MoneyDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => MoneyDto)
  estimatedCost?: MoneyDto;

  @ApiProperty({
    description: 'Updated estimated duration in minutes',
    required: false,
    example: 120,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  estimatedDuration?: number;
}
