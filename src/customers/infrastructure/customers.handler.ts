import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { BaseHandler } from '../../global/infrastructure/base.handler';
import { CRCustomerUseCase } from '../usecases/CRCustomer.usecase';
import { Customer } from './entities/customer.entity';
import { CreateCustomerReqDto } from './dtos/createCustomerReq.dto';
import { FindOneOptions } from 'typeorm';

@Injectable()
export class CustomerHandler extends BaseHandler {
  private readonly serviceName = CustomerHandler.name;

  constructor(
    private readonly cRCustomerUseCase: CRCustomerUseCase,
    private readonly jwtService: JwtService,
  ) {
    super(jwtService);
  }

  async handleCreate(createCustomerDto: CreateCustomerReqDto) {
    return this.resolve(this.cRCustomerUseCase.create(createCustomerDto));
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
