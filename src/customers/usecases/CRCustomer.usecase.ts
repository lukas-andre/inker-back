import { Injectable } from '@nestjs/common';
import { FindOneOptions } from 'typeorm';

import { BaseUseCase } from '../../global/domain/usecases/base.usecase';
import { Customer } from '../infrastructure/entities/customer.entity';
import { CustomerProvider } from '../infrastructure/providers/customer.provider';

import { CreateCustomerParams } from './interfaces/createCustomer.params';

@Injectable()
export class CRCustomerUseCase extends BaseUseCase {
  constructor(private readonly customerProvider: CustomerProvider) {
    super(CRCustomerUseCase.name);
  }

  async create(params: CreateCustomerParams): Promise<Customer> {
    const created = await this.customerProvider.create(params);

    return created;
  }

  async findOne(options: FindOneOptions<Customer>): Promise<Customer> {
    return this.customerProvider.findOne(options);
  }

  async findAll(options: FindOneOptions<Customer>): Promise<Customer[]> {
    return this.customerProvider.find(options);
  }

  async findById(id: number): Promise<Customer> {
    return this.customerProvider.findById(id);
  }
}
