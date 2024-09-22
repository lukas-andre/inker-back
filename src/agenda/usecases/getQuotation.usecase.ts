import { Injectable } from '@nestjs/common';

import { DomainNotFound } from '../../global/domain/exceptions/domain.exception';
import {
  BaseUseCase,
  UseCase,
} from '../../global/domain/usecases/base.usecase';
import { QuotationDto } from '../infrastructure/dtos/getQuotationRes.dto';
import { QuotationProvider } from '../infrastructure/providers/quotation.provider';

@Injectable()
export class GetQuotationUseCase extends BaseUseCase implements UseCase {
  constructor(private readonly quotationProvider: QuotationProvider) {
    super(GetQuotationUseCase.name);
  }

  async execute(id: number): Promise<Partial<QuotationDto>> {
    const quotation = await this.quotationProvider.findOne({
      where: { id },
      relations: ['history'],
    });

    if (!quotation) {
      throw new DomainNotFound('Quotation not found');
    }

    return quotation;
  }
}
