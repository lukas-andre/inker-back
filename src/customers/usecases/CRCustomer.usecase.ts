import { Injectable } from '@nestjs/common';
import { FindOneOptions } from 'typeorm';
import { BaseUseCase } from '../../global/domain/usecases/base.usecase';
import { CustomersService } from '../domain/customers.service';
import { Customer } from '../infrastructure/entities/customer.entity';
import { CreateCustomerParams } from './interfaces/createCustomer.params';

@Injectable()
export class CRCustomerUseCase extends BaseUseCase {
  constructor(private readonly customersService: CustomersService) {
    super(CRCustomerUseCase.name);
  }

  async create(params: CreateCustomerParams): Promise<Customer> {
    const created = await this.customersService.create(params);

    return created;
  }

  async findOne(options: FindOneOptions<Customer>): Promise<Customer> {
    return this.customersService.findOne(options);
  }

  async findAll(options: FindOneOptions<Customer>): Promise<Customer[]> {
    return this.customersService.find(options);
  }

  async findById(id: number): Promise<Customer> {
    return this.customersService.findById(id);
  }
}
