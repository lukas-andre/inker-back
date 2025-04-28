import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { MoneyEntity } from '../../../global/domain/models/money.model';
import { Transform } from 'class-transformer';

export class CreateQuotationOfferReqDto {
  @ApiPropertyOptional({
    description: 'Estimated cost for the tattoo session',
    type: () => MoneyEntity, // Indicate structure for Swagger
    example: { amount: 15000, currency: 'USD', scale: 2 }, // Example for Swagger
  })
  @IsOptional() // Cost might be optional initially?
  @Transform(({
    value
  }) => {
    if (!value) return null;
    return new MoneyEntity(value.amount, value.currency, value.scale);
  }, {
    toClassOnly: true
  })
  readonly estimatedCost?: MoneyEntity;

  @ApiPropertyOptional({
    description: 'Estimated duration of the session in minutes',
    example: 120,
  })
  @IsOptional()
  @IsNumber()
  @Min(15) // Minimum reasonable duration?
  readonly estimatedDuration?: number;

  @ApiPropertyOptional({
    description: 'Optional message from the artist to the customer',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  readonly message?: string;
} 