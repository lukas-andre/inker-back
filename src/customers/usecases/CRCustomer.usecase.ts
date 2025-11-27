import { Injectable } from '@nestjs/common';
import { FindOneOptions } from 'typeorm';

import { BaseUseCase } from '../../global/domain/usecases/base.usecase';
import { Customer } from '../infrastructure/entities/customer.entity';
import { CustomerRepository } from '../infrastructure/providers/customer.repository';

import { CreateCustomerParams } from './interfaces/createCustomer.params';

@Injectable()
export class CRCustomerUseCase extends BaseUseCase {
  constructor(private readonly customerRepository: CustomerRepository) {
    super(CRCustomerUseCase.name);
  }

  async create(params: CreateCustomerParams): Promise<Customer> {
    const created = await this.customerRepository.create(params);

    return created;
  }

  async findOne(options: FindOneOptions<Customer>): Promise<Customer> {
    return this.customerRepository.findOne(options);
  }

  async findAll(options: FindOneOptions<Customer>): Promise<Customer[]> {
    return this.customerRepository.find(options);
  }

  async findById(id: string): Promise<Customer> {
    return this.customerRepository.findById(id);
  }
}
