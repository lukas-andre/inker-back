import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MoneyEntity } from '../../../global/domain/models/money.model';

export class OpenQuotationOfferDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  artistId: string;

  @ApiProperty()
  artistName: string; // Assuming we fetch this

  @ApiProperty({ type: () => MoneyEntity })
  estimatedCost: MoneyEntity;

  @ApiPropertyOptional()
  message?: string;
} 