import { CreateCustomerDto } from '../dtos/createCustomer.dto';
import { CustomerHandler } from '../handlers/customers.handler';
export declare class CustomersController {
    private readonly customerHandler;
    constructor(customerHandler: CustomerHandler);
    create(createCustomerDto: CreateCustomerDto): Promise<import("../entities/customer.entity").Customer>;
}
