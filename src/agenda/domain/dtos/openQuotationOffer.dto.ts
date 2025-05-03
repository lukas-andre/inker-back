import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MoneyEntity } from '../../../global/domain/models/money.model';
import { OfferMessageDto } from './offerMessage.dto';
import { OfferMessage } from '../../infrastructure/entities/quotationOffer.entity';

/**
 * DTO representing an offer shown in the list of open quotations (Artist view)
 */
export class OpenQuotationOfferDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  artistId: string;

  @ApiProperty({ description: "Full name of the artist making the offer" })
  artistName: string;

  @ApiPropertyOptional({ type: () => MoneyEntity })
  estimatedCost?: MoneyEntity;

  @ApiPropertyOptional()
  message?: string;

  @ApiPropertyOptional({ type: [OfferMessageDto] })
  messages?: OfferMessage[];
} 