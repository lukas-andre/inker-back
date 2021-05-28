import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { CustomersService } from '../domain/customers.service';
import { handleServiceError } from '../../global/domain/utils/handleServiceError';
import { CreateCustomerParams } from './interfaces/createCustomer.params';
import { FindOneOptions } from 'typeorm';
import { Customer } from '../infrastructure/entities/customer.entity';
import { isServiceError } from 'src/global/domain/guards/isServiceError.guard';

@Injectable()
export class CRCustomerUseCase {
  private readonly serviceName = CRCustomerUseCase.name;
  private readonly logger = new Logger(this.serviceName);

  constructor(private readonly customersService: CustomersService) {}

  async create(params: CreateCustomerParams): Promise<Customer> {
    const created = await this.customersService.create(params);
    if (isServiceError(created)) {
      throw new ConflictException(handleServiceError(created, this.logger));
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
