import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { QuotationStatus, QuotationType } from '../../infrastructure/entities/quotation.entity';
import { CustomerDto } from '../../../customers/domain/dtos/customer.dto';
import { OpenQuotationOfferDto } from './openQuotationOffer.dto';
import { MoneyEntity } from '../../../global/domain/models/money.model';

/**
 * DTO for quotation data that will be nested within the ParticipatingQuotationOfferDto
 */
export class NestedQuotationDto {
  @ApiProperty({ description: 'ID of the quotation' })
  id: string;

  @ApiPropertyOptional({ description: 'Description provided by the customer for the quotation' })
  description?: string;

  @ApiProperty({ enum: QuotationStatus, description: 'Current status of the quotation' })
  status: QuotationStatus;

  @ApiProperty({ enum: QuotationType, description: 'Type of the quotation (Direct/Open)' })
  type: QuotationType;

  @ApiPropertyOptional({ description: 'Reference images uploaded by the customer for the quotation', type: [String] })
  referenceImages?: string[];

  @ApiPropertyOptional({ description: 'Date the quotation was originally created' })
  createdAt: Date;

  @ApiPropertyOptional({ description: 'Date the quotation was last updated' })
  updatedAt: Date;

  @ApiPropertyOptional({ type: () => MoneyEntity })
  minBudget?: MoneyEntity;

  @ApiPropertyOptional({ type: () => MoneyEntity })
  maxBudget?: MoneyEntity;

  @ApiPropertyOptional({ type: () => MoneyEntity })
  referenceBudget?: MoneyEntity;

  @ApiPropertyOptional({ description: 'ID de la imagen generada (si existe)' })
  generatedImageId?: string;
}

/**
 * DTO representing a Quotation Offer from the perspective of the participating artist,
 * enriched with relevant quotation and customer details.
 */
export class ParticipatingQuotationOfferDto extends OpenQuotationOfferDto {
  // Nested Quotation object instead of flattened fields
  @ApiProperty({ 
    type: () => NestedQuotationDto, 
    description: 'Details of the parent quotation' 
  })
  quotation: NestedQuotationDto;

  @ApiProperty({ type: () => CustomerDto, description: 'Customer who created the quotation' })
  customer: CustomerDto;

  // Offer specific details are inherited from QuotationOfferListItemDto
  // Ensure artist info is populated (inherited `artist` field)
  // Ensure distance is calculated if needed (inherited `distanceToCustomerKm` field)
}

/**
 * DTO for the response of the listParticipatingQuotations endpoint.
 */
export class ListParticipatingQuotationsResDto {
    @ApiProperty({ type: [ParticipatingQuotationOfferDto] })
    items: ParticipatingQuotationOfferDto[];

    @ApiProperty()
    total: number;
} 