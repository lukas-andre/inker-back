import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { CustomersService } from '../domain/customers.service';
import { CreateCustomerParams } from './interfaces/createCustomer.params';
import { FindOneOptions } from 'typeorm';
import { Customer } from '../infrastructure/entities/customer.entity';
import { isServiceError } from 'src/global/domain/guards/isServiceError.guard';
import { BaseUseCase } from 'src/global/domain/usecases/base.usecase';

@Injectable()
export class CRCustomerUseCase extends BaseUseCase {
  constructor(private readonly customersService: CustomersService) {
    super(CRCustomerUseCase.name);
  }

  async create(params: CreateCustomerParams): Promise<Customer> {
    const created = await this.customersService.create(params);
    if (isServiceError(created)) {
      throw new ConflictException(this.handleServiceError(created));
    }

    return created;
  }

  async findOne(options: FindOneOptions<Customer>): Promise<Customer> {
    return this.customersService.findOne(options);
  }

  async findAll(options: FindOneOptions<Customer>): Promise<Customer[]> {
    return this.customersService.find(options);
  }

  async findById(id: string): Promise<Customer> {
    return this.customersService.findById(id);
  }
}
