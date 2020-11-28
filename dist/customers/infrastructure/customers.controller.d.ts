import { CreateCustomerReqDto } from './dtos/createCustomerReq.dto';
import { CustomerHandler } from './customers.handler';
export declare class CustomersController {
    private readonly customerHandler;
    constructor(customerHandler: CustomerHandler);
    create(createCustomerDto: CreateCustomerReqDto): Promise<import("./entities/customer.entity").Customer>;
}
