import { IsEnum, IsOptional, IsString } from 'class-validator';

import {
  CUSTOMER_APPEAL_REASONS,
  CUSTOMER_CANCEL_REASONS,
  CUSTOMER_REJECT_REASONS,
  QuotationCustomerAppealReason,
  QuotationCustomerCancelReason,
  QuotationCustomerRejectReason,
} from '../entities/quotation.entity';

export enum CustomerQuotationAction {
  ACCEPT = 'accept',
  REJECT = 'reject',
  APPEAL = 'appeal',
  CANCEL = 'cancel',
}

export class CustomerQuotationActionDto {
  @IsEnum(CustomerQuotationAction)
  action: CustomerQuotationAction;

  @IsEnum(CUSTOMER_REJECT_REASONS)
  @IsOptional()
  rejectionReason?: QuotationCustomerRejectReason;

  @IsOptional()
  @IsEnum(CUSTOMER_APPEAL_REASONS)
  appealReason?: QuotationCustomerAppealReason;

  @IsString()
  @IsOptional()
  additionalDetails?: string;

  // @IsOptional()
  // @IsEnum(CUSTOMER_CANCEL_REASONS)
  // cancelReason?: QuotationCustomerCancelReason;
}
