import { Module } from '@nestjs/common';
import { CustomersService } from './use_cases/services/customers.service';
import { CustomersController } from './infrastructure/controllers/customers.controller';
import { Customer } from './infrastructure/entities/customer.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerHandler } from './use_cases/customers.handler';

@Module({
  imports: [TypeOrmModule.forFeature([Customer], 'customer-db')],
  providers: [CustomersService, CustomerHandler],
  controllers: [CustomersController],
  exports: [CustomersService],
})
export class CustomersModule {}
