import { Injectable } from '@nestjs/common';

import { DomainNotFound } from '../../../global/domain/exceptions/domain.exception';
import {
  BaseUseCase,
  UseCase,
} from '../../../global/domain/usecases/base.usecase';
import { UserType } from '../../../users/domain/enums/userType.enum';
import { QuotationRepository } from '../../infrastructure/repositories/quotation.provider';

@Injectable()
export class MarkQuotationAsReadUseCase extends BaseUseCase implements UseCase {
  constructor(private readonly quotationProvider: QuotationRepository) {
    super(MarkQuotationAsReadUseCase.name);
  }

  async execute(quotationId: string, userType: UserType): Promise<void> {
    const quotation = await this.quotationProvider.findById(quotationId);

    if (!quotation) {
      throw new DomainNotFound('Quotation not found');
    }

    await this.quotationProvider.markAsRead(quotationId, userType);
  }
}
