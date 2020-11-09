import { CreateCustomerDto } from '../dtos/createCustomer.dto';
import { Customer } from '../entities/customer.entity';
import { Repository, FindManyOptions, FindOneOptions, DeleteResult, DeepPartial } from 'typeorm';
import { FollowTopic } from '../interfaces/customerFollows.interface';
import { ServiceError } from 'src/global/interfaces/serviceError';
export declare class CustomersService {
    private readonly customersRepository;
    private readonly serviceName;
    constructor(customersRepository: Repository<Customer>);
    create(dto: CreateCustomerDto): Promise<Customer | ServiceError>;
    addFollow(customer: Customer, topic: string, newFollow: FollowTopic): Promise<Customer>;
    findById(id: string): Promise<Customer>;
    find(options: FindManyOptions<Customer>): Promise<Customer[]>;
    findOne(options?: FindOneOptions<Customer>): Promise<Customer | undefined>;
    save(customer: DeepPartial<Customer>): Promise<Customer>;
    delete(id: string): Promise<DeleteResult>;
}
