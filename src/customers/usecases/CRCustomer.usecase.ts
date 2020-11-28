import { Injectable, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CustomersService } from '../domain/customers.service';
import { serviceErrorStringify } from '../../global/domain/utils/serviceErrorStringify';
import { ServiceError } from '../../global/domain/interfaces/serviceError';
import { CreateCustomerParams } from './interfaces/createCustomer.params';
import { FindOneOptions } from 'typeorm';
import { Customer } from '../infrastructure/entities/customer.entity';

@Injectable()
export class CRCustomerUseCase {
  constructor(
    private readonly customersService: CustomersService,
  ) {}

  async create(params: CreateCustomerParams): Promise<Customer> {
    const created = await this.customersService.create(params);
    if (created instanceof ServiceError) {
      throw new ConflictException(serviceErrorStringify(created));
    }

    return created;
  }
  
  async findOne(options: FindOneOptions<Customer>) : Promise<Customer> {
    return this.customersService.findOne(options);
  }

  async findAll(options: FindOneOptions<Customer>) : Promise<Customer[]> {
    return this.customersService.find(options);
  }

  async findById(id: string) : Promise<Customer> {
    return this.customersService.findById(id);
  }
}
