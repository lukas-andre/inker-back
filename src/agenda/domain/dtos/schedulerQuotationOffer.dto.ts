import { ApiProperty } from '@nestjs/swagger';

import { MoneyEntity } from '../../../global/domain/models/money.model';
import { QuotationOfferStatus } from '../../infrastructure/entities/quotationOffer.entity';

/**
 * DTO for quotation offers with standardized start/end times for scheduler view
 */
export class SchedulerQuotationOfferDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  quotationId: string;

  @ApiProperty()
  artistId: string;

  @ApiProperty({ type: () => MoneyEntity })
  estimatedCost?: MoneyEntity;

  @ApiProperty({ description: 'Start date/time of the proposed appointment' })
  start: Date;

  @ApiProperty({ description: 'End date/time of the proposed appointment' })
  end: Date;

  @ApiProperty({ 
    description: 'Original estimated date from the offer',
    deprecated: true 
  })
  estimatedDate?: Date;

  @ApiProperty({ 
    description: 'Duration in minutes',
    deprecated: true 
  })
  estimatedDuration?: number;

  @ApiProperty({ nullable: true })
  message?: string;

  @ApiProperty({ enum: QuotationOfferStatus })
  status: QuotationOfferStatus;

  @ApiProperty({ type: 'array', items: { type: 'object' } })
  messages?: any[];
}