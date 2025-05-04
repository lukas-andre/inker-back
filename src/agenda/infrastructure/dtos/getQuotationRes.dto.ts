import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { MultimediasMetadataInterface } from '../../../multimedias/interfaces/multimediasMetadata.interface';
import {
  QuotationStatus,
  QuotationType,
} from '../entities/quotation.entity';
import { MoneyEntity } from '../../../global/domain/models/money.model';
import { ArtistDto } from '../../../artists/domain/dtos/artist.dto';
import { CustomerDto } from '../../../customers/domain/dtos/customer.dto';
import { LocationDto } from '../../../global/infrastructure/dtos/geometry.dto';
import { Stencil } from '../../../artists/infrastructure/entities/stencil.entity';
import { TattooDesignCacheEntity } from '../../../tattoo-generator/infrastructure/database/entities/tattooDesignCache.entity';
import { OpenQuotationOfferDto } from '../../domain/dtos/openQuotationOffer.dto';

// Define local const for enum values used in decorators if not exported
const CUSTOMER_APPEAL_REASONS = [
  'date_change',
  'price_change',
  'design_change',
  'other',
] as const;
type QuotationCustomerAppealReason = (typeof CUSTOMER_APPEAL_REASONS)[number];

export class GetQuotationResDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  customerId: string;

  @ApiPropertyOptional()
  artistId?: string;

  @ApiPropertyOptional()
  stencilId?: string;

  @ApiProperty({ enum: QuotationType })
  type: QuotationType;

  @ApiProperty()
  description: string;

  @ApiPropertyOptional()
  referenceImages?: MultimediasMetadataInterface;

  @ApiPropertyOptional()
  proposedDesigns?: MultimediasMetadataInterface;

  @ApiProperty({
    enum: QuotationStatus,
  })
  status: QuotationStatus;

  @ApiPropertyOptional()
  customerLat?: number;

  @ApiPropertyOptional()
  customerLon?: number;

  @ApiPropertyOptional()
  customerTravelRadiusKm?: number;

  @ApiPropertyOptional({ type: () => MoneyEntity })
  estimatedCost?: MoneyEntity;

  @ApiPropertyOptional()
  responseDate?: Date;

  @ApiPropertyOptional()
  appointmentDate?: Date;

  @ApiPropertyOptional()
  appointmentDuration?: number;

  @ApiPropertyOptional()
  rejectedReason?: string;

  @ApiPropertyOptional({ enum: CUSTOMER_APPEAL_REASONS })
  appealedReason?: QuotationCustomerAppealReason;

  @ApiPropertyOptional()
  appealedDate?: Date;

  @ApiPropertyOptional()
  canceledReason?: string;

  @ApiPropertyOptional()
  canceledDate?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional({ type: () => ArtistDto })
  artist?: ArtistDto;

  @ApiProperty({ type: () => CustomerDto })
  customer: CustomerDto;

  @ApiPropertyOptional({ type: () => LocationDto })
  location?: LocationDto;

  @ApiPropertyOptional({ type: () => Stencil })
  stencil?: Stencil;

  @ApiPropertyOptional({ type: [OpenQuotationOfferDto] })
  offers?: OpenQuotationOfferDto[];

  @ApiPropertyOptional({ type: () => TattooDesignCacheEntity })
  tattooDesignCache?: TattooDesignCacheEntity;

  @ApiPropertyOptional({ description: 'Indicates if the current artist has offered on this quotation' })
  hasOffered?: boolean;
}
