import { Module } from '@nestjs/common';
import { CustomersService } from './domain/customers.service';
import { CustomersController } from './infrastructure/customers.controller';
import { Customer } from './infrastructure/entities/customer.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerHandler } from './infrastructure/customers.handler';
import { CRCustomerUseCase } from './usecases/CRCustomer.usecase';

@Module({
  imports: [TypeOrmModule.forFeature([Customer], 'customer-db')],
  providers: [CustomersService, CustomerHandler, CRCustomerUseCase],
  controllers: [CustomersController],
  exports: [CustomersService],
})
export class CustomersModule {}
