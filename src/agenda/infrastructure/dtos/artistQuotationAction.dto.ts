import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

import {
  ARTIST_REJECT_REASONS,
  QuotationArtistRejectReason,
} from '../entities/quotation.entity';

export enum ArtistQuoteAction {
  QUOTE = 'quote',
  REJECT = 'reject',
  ACCEPT_APPEAL = 'accept_appeal',
  REJECT_APPEAL = 'reject_appeal',
}

export class ArtistQuotationActionDto {
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

  @IsEnum(ARTIST_REJECT_REASONS)
  @IsOptional()
  rejectionReason?: QuotationArtistRejectReason;
}
