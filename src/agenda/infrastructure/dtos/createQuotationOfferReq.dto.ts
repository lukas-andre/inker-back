import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsNumber, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { MoneyDto } from '../../../global/domain/dtos/money.dto';

export class CreateQuotationOfferReqDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => MoneyDto)
  estimatedCost?: MoneyDto;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  appointmentDate?: Date;

  @IsNumber()
  @IsOptional()
  appointmentDuration?: number;

  @IsString()
  @IsOptional()
  additionalDetails?: string;

  @ApiPropertyOptional({
    description: 'Optional message from the artist to the customer',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  readonly message?: string;
} 