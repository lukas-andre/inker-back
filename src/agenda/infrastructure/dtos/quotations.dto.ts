import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

import {
  ARTIST_REJECT_REASONS,
  CUSTOMER_CANCEL_REASONS,
  CUSTOMER_REJECT_REASONS,
  QuotationAppealedReason,
  QuotationArtistRejectReason,
  QuotationCustomerCancelReason,
  QuotationCustomerRejectReason,
  QuotationSystemCancelReason,
  SYSTEM_CANCEL_REASONS,
} from '../entities/quotation.entity';

// TODO: separate the DTOs into different files
export class QuotationEarlyCancelDto {
  @IsEnum(CUSTOMER_CANCEL_REASONS)
  reason: QuotationCustomerCancelReason;

  @IsString()
  @IsOptional()
  cancelReasonDetails?: string;
}

export class QuotationArtistRejectDto {
  @IsEnum(ARTIST_REJECT_REASONS)
  reason: QuotationArtistRejectReason;

  @IsString()
  @IsOptional()
  rejectReasonDetails?: string;
}

export enum ArtistQuoteAction {
  QUOTE = 'quote',
  REJECT = 'reject',
  ACCEPT_APPEAL = 'accept_appeal',
  REJECT_APPEAL = 'reject_appeal',
}

export class ArtistQuoteDto {
  @IsEnum(ArtistQuoteAction)
  action: ArtistQuoteAction;

  @IsNumber()
  @IsOptional()
  estimatedCost?: number;

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

  @IsString()
  @IsOptional()
  rejectionReason?: string;
}

export class QuotationCustomerRejectDto {
  @IsEnum(CUSTOMER_REJECT_REASONS)
  reason: QuotationCustomerRejectReason;

  @IsString()
  @IsOptional()
  rejectReasonDetails?: string;
}

export class QuotationCustomerAcceptDto {
  @IsString()
  @IsOptional()
  acceptanceComment?: string;
}

export class QuotationCustomerAppealDto {
  @IsEnum(['dateChange', 'priceChange', 'designChange'])
  appealedReason: QuotationAppealedReason;

  @IsDate()
  @Type(() => Date)
  @ValidateIf(o => o.appealedReason === 'dateChange')
  @IsOptional()
  proposedDate?: Date;

  @IsNumber()
  @Min(0)
  @ValidateIf(o => o.appealedReason === 'priceChange')
  @IsOptional()
  proposedPrice?: number;

  @IsString()
  @IsOptional()
  appealDetails?: string;
}

// This DTO is for system cancellations, which might be triggered by a background job
export class SystemCancelQuotationDto {
  @IsEnum(SYSTEM_CANCEL_REASONS)
  reason: QuotationSystemCancelReason;

  @IsString()
  @IsOptional()
  cancelReasonDetails?: string;
}

// CUSTOMER ACTIONS DTO

export enum CustomerQuotationAction {
  ACCEPT = 'accept',
  REJECT = 'reject',
  APPEAL = 'appeal',
}

export class CustomerQuotationActionDto {
  @IsEnum(CustomerQuotationAction)
  action: CustomerQuotationAction;

  @IsString()
  @IsOptional()
  rejectionReason?: string;

  @IsString()
  @IsOptional()
  appealReason?: string;

  @IsString()
  @IsOptional()
  additionalDetails?: string;
}
