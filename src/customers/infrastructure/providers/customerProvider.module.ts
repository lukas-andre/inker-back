import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Customer } from '../entities/customer.entity';

import { CustomerProvider } from './customer.provider';

@Module({
  imports: [TypeOrmModule.forFeature([Customer], 'customer-db')],
  providers: [CustomerProvider],
  exports: [CustomerProvider],
})
export class CustomerProviderModule {}
