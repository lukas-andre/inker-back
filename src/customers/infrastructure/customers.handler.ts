import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { handleServiceError } from '../../global/domain/utils/handleServiceError';
import { ServiceError } from '../../global/domain/interfaces/serviceError';
import { CreateCustomerReqDto } from './dtos/createCustomerReq.dto';
import { CRCustomerUseCase } from '../usecases/CRCustomer.usecase';
import { FindOneOptions } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { isServiceError } from 'src/global/domain/guards/isServiceError.guard';

@Injectable()
export class CustomerHandler {
  private readonly serviceName = CustomerHandler.name;
  private readonly logger = new Logger(this.serviceName);

  constructor(private readonly cRCustomerUseCase: CRCustomerUseCase) {}

  async handleCreate(createCustomerDto: CreateCustomerReqDto) {
    const created = await this.cRCustomerUseCase.create(createCustomerDto);
    if (isServiceError(created)) {
      throw new ConflictException(handleServiceError(created, this.logger));
    }

    return created;
  }

  async handleFindAll(options: FindOneOptions<Customer>): Promise<Customer[]> {
    return this.cRCustomerUseCase.findAll(options);
  }

  async handleFindOne(options: FindOneOptions<Customer>): Promise<Customer> {
    return this.cRCustomerUseCase.findOne(options);
  }

  async handleFindById(id: string): Promise<Customer> {
    return this.cRCustomerUseCase.findById(id);
  }
}
