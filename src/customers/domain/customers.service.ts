import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeepPartial,
  DeleteResult,
  FindManyOptions,
  FindOneOptions,
  Repository,
} from 'typeorm';
import { ServiceError } from '../../global/domain/interfaces/serviceError';
import { BaseService } from '../../global/domain/services/base.service';
import { Customer } from '../infrastructure/entities/customer.entity';
import { CreateCustomerParams } from '../usecases/interfaces/createCustomer.params';
import { FollowTopic } from './interfaces/customerFollows.interface';

@Injectable()
export class CustomersService extends BaseService {
  constructor(
    @InjectRepository(Customer, 'customer-db')
    private readonly customersRepository: Repository<Customer>,
  ) {
    super(CustomersService.name);
  }

  async create(params: CreateCustomerParams): Promise<Customer | ServiceError> {
    const exists = await this.customersRepository.findOne({
      where: {
        userId: params.userId,
      },
    });

    if (exists) {
      return this.serviceError(
        this.create,
        `Customer with user id: ${params.userId} already exist`,
      );
    }

    try {
      return this.customersRepository.save({
        userId: params.userId,
        firstName: params.firstName,
        lastName: params.lastName,
        contactPhoneNumber: params.phoneNumber,
        contactEmail: params.contactEmail,
      });
    } catch (error) {
      return this.serviceError(
        this.create,
        'Problems saving customer',
        error.message,
      );
    }
  }

  async addFollow(customer: Customer, topic: string, newFollow: FollowTopic) {
    customer.follows.map(
      follow => (follow[topic] = [...follow[topic], newFollow]),
    );
    return this.customersRepository.save(customer);
  }

  async findById(id: number) {
    return this.customersRepository.findOne({ where: { id } });
  }

  async find(options: FindManyOptions<Customer>) {
    return this.customersRepository.find(options);
  }

  async findOne(
    options?: FindOneOptions<Customer>,
  ): Promise<Customer | undefined> {
    return this.customersRepository.findOne(options);
  }
  async save(customer: DeepPartial<Customer>): Promise<Customer> {
    return this.customersRepository.save(customer);
  }
  async delete(id: string): Promise<DeleteResult> {
    return this.customersRepository.delete(id);
  }
}
