import { ConfigService } from '@nestjs/config';
import { CustomersService } from '../services/customers.service';
import { CreateCustomerDto } from '../dtos/createCustomer.dto';
export declare class CustomerHandler {
    private readonly customersService;
    private readonly configService;
    constructor(customersService: CustomersService, configService: ConfigService);
    handleCreate(createCustomerDto: CreateCustomerDto): Promise<import("../entities/customer.entity").Customer>;
}
