import { Module } from '@nestjs/common';
import { CustomersService } from './services/customers.service';
import { CustomersController } from './controllers/customers.controller';
import { Customer } from './entities/customer.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerHandler } from './handlers/customers.handler';

@Module({
  imports: [TypeOrmModule.forFeature([Customer], 'customer-db')],
  providers: [CustomersService, CustomerHandler],
  controllers: [CustomersController],
  exports: [CustomersService],
})
export class CustomersModule {}
