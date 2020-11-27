import { Injectable } from '@nestjs/common';
import { CreateCustomerDto } from '../../infrastructure/dtos/createCustomer.dto';
import { Customer } from '../../infrastructure/entities/customer.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  FindManyOptions,
  FindOneOptions,
  DeleteResult,
  DeepPartial,
} from 'typeorm';
import { FollowTopic } from '../../domain/interfaces/customerFollows.interface';
import { ServiceError } from '../../../global/domain/interfaces/serviceError';

@Injectable()
export class CustomersService {
  private readonly serviceName: string = CustomersService.name;

  constructor(
    @InjectRepository(Customer, 'customer-db')
    private readonly customersRepository: Repository<Customer>,
  ) {}

  async create(dto: CreateCustomerDto): Promise<Customer | ServiceError> {
    const exists = await this.customersRepository.findOne({
      userId: dto.userId,
    });

    if (exists) {
      return {
        error: `Customer with user id: ${dto.userId} already exist`,
        subject: this.serviceName,
        method: this.create.name,
      } as ServiceError;
    }

    const newCustomer = Object.assign(new Customer());

    return await this.customersRepository.save(newCustomer);
  }

  async addFollow(customer: Customer, topic: string, newFollow: FollowTopic) {
    customer.follows.map(
      follow => (follow[topic] = [...follow[topic], newFollow]),
    );
    return await this.customersRepository.save(customer);
  }

  async findById(id: string) {
    return await this.customersRepository.findOne(id);
  }

  async find(options: FindManyOptions<Customer>) {
    return await this.customersRepository.find(options);
  }

  async findOne(
    options?: FindOneOptions<Customer>,
  ): Promise<Customer | undefined> {
    return await this.customersRepository.findOne(options);
  }
  async save(customer: DeepPartial<Customer>): Promise<Customer> {
    return await this.customersRepository.save(customer);
  }
  async delete(id: string): Promise<DeleteResult> {
    return await this.customersRepository.delete(id);
  }
}
