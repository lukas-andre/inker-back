import { Injectable, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CustomersService } from '../services/customers.service';
import { CreateCustomerDto } from '../dtos/createCustomer.dto';
import { serviceErrorStringify } from 'src/global/utils/serviceErrorStringify';
import { ServiceError } from 'src/global/interfaces/serviceError';

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
