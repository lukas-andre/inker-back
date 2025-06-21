import { Injectable } from '@nestjs/common';
import { FindOneOptions } from 'typeorm';

import { RequestContextService } from 'src/global/infrastructure/services/requestContext.service';

import { CRCustomerUseCase } from '../usecases/CRCustomer.usecase';
import { FullTextSearchCustomerUseCase } from '../usecases/fullTextSearchCustomer.usecase';
import { UpdateCustomerBasicInfoUseCase } from '../usecases/updateCustomerBasicInfo.usecase';

import { CreateCustomerReqDto } from './dtos/createCustomerReq.dto';
import { UpdateCustomerDto } from './dtos/updateCustomerReq.dto';
import { Customer } from './entities/customer.entity';

@Injectable()
export class CustomerHandler {
  constructor(
    private readonly cRCustomerUseCase: CRCustomerUseCase,
    private readonly fullTextSearchCustomerUseCase: FullTextSearchCustomerUseCase,
    private readonly updateCustomerBasicInfoUseCase: UpdateCustomerBasicInfoUseCase,
    private readonly requestContext: RequestContextService,
  ) {}

  async handleCreate(createCustomerDto: CreateCustomerReqDto) {
    return this.cRCustomerUseCase.create(createCustomerDto);
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

  async handleFindMe(): Promise<Customer> {
    const { userTypeId } = this.requestContext;
    return this.cRCustomerUseCase.findById(userTypeId);
  }

  async handleSearchByTerm(term: string): Promise<Customer[]> {
    return this.fullTextSearchCustomerUseCase.execute(term);
  }

  async handleUpdateMe(dto: UpdateCustomerDto): Promise<Customer> {
    const { userTypeId } = this.requestContext;
    return this.updateCustomerBasicInfoUseCase.execute(userTypeId, dto);
  }

  async handleUpdateCustomerBasicInfo(
    id: string,
    dto: UpdateCustomerDto,
  ): Promise<Customer> {
    return this.updateCustomerBasicInfoUseCase.execute(id, dto);
  }
}
