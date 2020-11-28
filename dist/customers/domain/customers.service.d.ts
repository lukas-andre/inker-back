import { Customer } from '../infrastructure/entities/customer.entity';
import { Repository, FindManyOptions, FindOneOptions, DeleteResult, DeepPartial } from 'typeorm';
import { FollowTopic } from './interfaces/customerFollows.interface';
import { ServiceError } from '../../global/domain/interfaces/serviceError';
import { CreateCustomerParams } from '../usecases/interfaces/createCustomer.params';
export declare class CustomersService {
    private readonly customersRepository;
    private readonly serviceName;
    constructor(customersRepository: Repository<Customer>);
    create(pararms: CreateCustomerParams): Promise<Customer | ServiceError>;
    addFollow(customer: Customer, topic: string, newFollow: FollowTopic): Promise<Customer>;
    findById(id: string): Promise<Customer>;
    find(options: FindManyOptions<Customer>): Promise<Customer[]>;
    findOne(options?: FindOneOptions<Customer>): Promise<Customer | undefined>;
    save(customer: DeepPartial<Customer>): Promise<Customer>;
    delete(id: string): Promise<DeleteResult>;
}
