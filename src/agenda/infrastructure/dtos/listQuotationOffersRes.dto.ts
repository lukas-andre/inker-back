import { ApiProperty } from '@nestjs/swagger';

import { QuotationOfferListItemDto } from '../../domain/dtos/quotationOffer.dto';

export class ListQuotationOffersResDto {
  @ApiProperty({ type: [QuotationOfferListItemDto] })
  offers: QuotationOfferListItemDto[];

  // Add pagination metadata if needed
}

export class GetQuotationOfferResDto extends QuotationOfferListItemDto {
  // Potentially add more details specific to retrieving a single offer
  // For now, it inherits everything from the list item DTO
}
