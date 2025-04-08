import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Customer } from '../entities/customer.entity';

import { CustomerRepository } from './customer.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Customer], 'customer-db')],
  providers: [CustomerRepository],
  exports: [CustomerRepository],
})
export class CustomerRepositoryModule {}
