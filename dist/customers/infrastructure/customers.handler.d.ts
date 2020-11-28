import { CreateCustomerReqDto } from './dtos/createCustomerReq.dto';
import { CRCustomerUseCase } from '../usecases/CRCustomer.usecase';
import { FindOneOptions } from 'typeorm';
import { Customer } from './entities/customer.entity';
export declare class CustomerHandler {
    private readonly CRCustomerUseCase;
    constructor(CRCustomerUseCase: CRCustomerUseCase);
    handleCreate(createCustomerDto: CreateCustomerReqDto): Promise<Customer>;
    handleFindAll(options: FindOneOptions<Customer>): Promise<Customer[]>;
    handleFindOne(options: FindOneOptions<Customer>): Promise<Customer>;
    handleFindById(id: string): Promise<Customer>;
}
