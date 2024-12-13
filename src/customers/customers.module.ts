import { Module } from '@nestjs/common';

import { CustomersController } from './infrastructure/customers.controller';
import { CustomerHandler } from './infrastructure/customers.handler';
import { CustomerProviderModule } from './infrastructure/providers/customerProvider.module';
import { CRCustomerUseCase } from './usecases/CRCustomer.usecase';
import { FullTextSearchCustomerUseCase } from './usecases/fullTextSearchCustomer.usecase';
import { UpdateCustomerBasicInfoUseCase } from './usecases/updateCustomerBasicInfo.usecase';

@Module({
  imports: [CustomerProviderModule],
  controllers: [CustomersController],
  providers: [
    CustomerHandler,
    CRCustomerUseCase,
    FullTextSearchCustomerUseCase,
    UpdateCustomerBasicInfoUseCase
  ],
})
export class CustomersModule { }
