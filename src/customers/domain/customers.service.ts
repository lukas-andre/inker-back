import { Injectable } from '@nestjs/common';
import { Customer } from '../infrastructure/entities/customer.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  FindManyOptions,
  FindOneOptions,
  DeleteResult,
  DeepPartial,
} from 'typeorm';
import { FollowTopic } from './interfaces/customerFollows.interface';
import { ServiceError } from '../../global/domain/interfaces/serviceError';
import { CreateCustomerParams } from '../usecases/interfaces/createCustomer.params';
import { BaseService } from 'src/global/domain/services/base.service';

@Injectable()
export class CustomersService extends BaseService {
  constructor(
    @InjectRepository(Customer, 'customer-db')
    private readonly customersRepository: Repository<Customer>,
  ) {
    super(CustomersService.name);
  }

  async create(
    pararms: CreateCustomerParams,
  ): Promise<Customer | ServiceError> {
    const exists = await this.customersRepository.findOne({
      userId: pararms.userId,
    });

    if (exists) {
      return this.serviceError(
        this.create,
        `Customer with user id: ${pararms.userId} already exist`,
      );
    }

    try {
      return this.customersRepository.save({
        userId: pararms.userId,
        firstName: pararms.firstName,
        lastName: pararms.lastName,
        contactPhoneNumber: pararms.phoneNumber,
        contactEmail: pararms.contactEmail,
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
      (follow) => (follow[topic] = [...follow[topic], newFollow]),
    );
    return this.customersRepository.save(customer);
  }

  async findById(id: string) {
    return this.customersRepository.findOne(id);
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
