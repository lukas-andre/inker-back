import {
  Injectable,
  ConflictException,
} from '@nestjs/common';
import { serviceErrorStringify } from '../../global/domain/utils/serviceErrorStringify';
import { ServiceError } from '../../global/domain/interfaces/serviceError';
import { CreateCustomerReqDto } from './dtos/createCustomerReq.dto';
import { CRCustomerUseCase } from '../usecases/CRCustomer.usecase';
import { FindOneOptions } from 'typeorm';
import { Customer } from './entities/customer.entity';

@Injectable()
export class CustomerHandler {
  constructor(private readonly CRCustomerUseCase: CRCustomerUseCase) {}

  async handleCreate(createCustomerDto: CreateCustomerReqDto) {
    const created = await this.CRCustomerUseCase.create(createCustomerDto);
    if (created instanceof ServiceError) {
      throw new ConflictException(serviceErrorStringify(created));
    }

    return created;
  }

  async handleFindAll(options: FindOneOptions<Customer>): Promise<Customer[]> {
    return this.CRCustomerUseCase.findAll(options);
  }

  async handleFindOne(options: FindOneOptions<Customer>): Promise<Customer> {
    return this.CRCustomerUseCase.findOne(options);
  }

  async handleFindById(id: string): Promise<Customer> {
    return this.CRCustomerUseCase.findById(id);
  }
}
