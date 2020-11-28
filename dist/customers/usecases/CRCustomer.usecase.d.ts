import { CustomersService } from '../domain/customers.service';
import { CreateCustomerParams } from './interfaces/createCustomer.params';
import { FindOneOptions } from 'typeorm';
import { Customer } from '../infrastructure/entities/customer.entity';
export declare class CRCustomerUseCase {
    private readonly customersService;
    constructor(customersService: CustomersService);
    create(params: CreateCustomerParams): Promise<Customer>;
    findOne(options: FindOneOptions<Customer>): Promise<Customer>;
    findAll(options: FindOneOptions<Customer>): Promise<Customer[]>;
    findById(id: string): Promise<Customer>;
}
