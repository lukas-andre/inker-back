import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FindOneOptions } from 'typeorm';

import { BaseHandler } from '../../global/infrastructure/base.handler';
import { CRCustomerUseCase } from '../usecases/CRCustomer.usecase';

import { CreateCustomerReqDto } from './dtos/createCustomerReq.dto';
import { Customer } from './entities/customer.entity';

@Injectable()
export class CustomerHandler extends BaseHandler {
  constructor(
    private readonly cRCustomerUseCase: CRCustomerUseCase,
    private readonly jwtService: JwtService,
  ) {
    super(jwtService);
  }

  async handleCreate(createCustomerDto: CreateCustomerReqDto) {
    return this.cRCustomerUseCase.create(createCustomerDto);
  }

  async handleFindAll(options: FindOneOptions<Customer>): Promise<Customer[]> {
    return this.cRCustomerUseCase.findAll(options);
  }

  async handleFindOne(options: FindOneOptions<Customer>): Promise<Customer> {
    return this.cRCustomerUseCase.findOne(options);
  }

  async handleFindById(id: number): Promise<Customer> {
    return this.cRCustomerUseCase.findById(id);
  }
}
