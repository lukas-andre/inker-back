import { Injectable, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CustomersService } from './services/customers.service';
import { CreateCustomerDto } from '../infrastructure/dtos/createCustomer.dto';
import { serviceErrorStringify } from '../../global/domain/utils/serviceErrorStringify';
import { ServiceError } from '../../global/domain/interfaces/serviceError';

@Injectable()
export class CustomerHandler {
  constructor(
    private readonly customersService: CustomersService,
    private readonly configService: ConfigService,
  ) {}

  async handleCreate(createCustomerDto: CreateCustomerDto) {
    const created = await this.customersService.create(createCustomerDto);
    if (created instanceof ServiceError) {
      throw new ConflictException(serviceErrorStringify(created));
    }

    return created;
  }
}
