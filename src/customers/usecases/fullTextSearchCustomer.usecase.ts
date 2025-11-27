import { Injectable } from '@nestjs/common';

import { BaseUseCase } from '../../global/domain/usecases/base.usecase';
import { Customer } from '../infrastructure/entities/customer.entity';
import { CustomerRepository } from '../infrastructure/providers/customer.repository';

@Injectable()
export class FullTextSearchCustomerUseCase extends BaseUseCase {
  constructor(private readonly customerRepository: CustomerRepository) {
    super(FullTextSearchCustomerUseCase.name);
  }

  async execute(term: string): Promise<Customer[]> {
    const created = await this.customerRepository.searchByTerm(term);

    return created;
  }
}
