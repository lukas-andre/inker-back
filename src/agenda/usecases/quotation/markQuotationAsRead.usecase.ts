import { Injectable } from '@nestjs/common';
import { BaseUseCase, UseCase } from '../../../global/domain/usecases/base.usecase';
import { QuotationProvider } from '../../infrastructure/providers/quotation.provider';
import { DomainNotFound } from '../../../global/domain/exceptions/domain.exception';
import { UserType } from '../../../users/domain/enums/userType.enum';

@Injectable()
export class MarkQuotationAsReadUseCase extends BaseUseCase implements UseCase {
  constructor(
    private readonly quotationProvider: QuotationProvider,
  ) {
    super(MarkQuotationAsReadUseCase.name);
  }

  async execute(
    quotationId: number,
    userType: UserType,
  ): Promise<void> {
    const quotation = await this.quotationProvider.findById(quotationId);
    
    if (!quotation) {
      throw new DomainNotFound('Quotation not found');
    }

    await this.quotationProvider.markAsRead(quotationId, userType);
  }
}