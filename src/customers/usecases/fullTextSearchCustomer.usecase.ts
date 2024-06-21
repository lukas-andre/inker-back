import { Injectable } from '@nestjs/common';

import { BaseUseCase } from '../../global/domain/usecases/base.usecase';
import { Customer } from '../infrastructure/entities/customer.entity';
import { CustomerProvider } from '../infrastructure/providers/customer.provider';

@Injectable()
export class FullTextSearchCustomerUseCase extends BaseUseCase {
  constructor(private readonly customerProvider: CustomerProvider) {
    super(FullTextSearchCustomerUseCase.name);
  }

  async execute(term: string): Promise<Customer[]> {
    const created = await this.customerProvider.searchByTerm(term);

    return created;
  }
}
