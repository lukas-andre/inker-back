import { Transform, Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { MoneyDto } from '../../../global/domain/dtos/money.dto';
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
  // @IsEnum(ArtistQuoteAction)
  action: ArtistQuoteAction;

  @IsOptional()
  @ValidateNested()
  @Type(() => MoneyDto)
  estimatedCost?: MoneyDto;

  @IsDate()
  @Type(() => Date)
  // @Transform(({ value }) => new Date(value))
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
