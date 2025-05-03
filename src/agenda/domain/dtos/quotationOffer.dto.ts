import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MoneyEntity } from '../../../global/domain/models/money.model';
import { QuotationOfferStatus, OfferMessage } from '../../infrastructure/entities/quotationOffer.entity';
import { ArtistDto } from '../../../artists/domain/dtos/artist.dto'; // Assuming you have an ArtistDto
import { OfferMessageDto } from './offerMessage.dto'; // Import OfferMessageDto for Swagger

// Base DTO for Quotation Offer data
export class QuotationOfferDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  quotationId: string;

  @ApiProperty()
  artistId: string;

  @ApiPropertyOptional({ type: () => MoneyEntity })
  estimatedCost?: MoneyEntity;

  @ApiPropertyOptional()
  estimatedDuration?: number; // in minutes

  @ApiPropertyOptional()
  message?: string;

  @ApiProperty({ enum: QuotationOfferStatus })
  status: QuotationOfferStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional({ type: [OfferMessageDto] }) // Use DTO for Swagger
  messages?: OfferMessage[]; // Keep interface for type safety in code
}

// DTO for listing offers, potentially including artist details and distance
export class QuotationOfferListItemDto extends QuotationOfferDto {
  @ApiPropertyOptional({ type: () => ArtistDto })
  artist?: ArtistDto; // Include basic artist info

  @ApiPropertyOptional({
    description: 'Estimated distance from offering artist to customer location in KM',
  })
  distanceToCustomerKm?: number;
} 