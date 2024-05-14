import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeepPartial,
  DeleteResult,
  FindManyOptions,
  FindOneOptions,
  Repository,
} from 'typeorm';

import { BaseComponent } from '../../../global/domain/components/base.component';
import {
  DBServiceCreateException,
  DbServiceBadRule,
} from '../../../global/infrastructure/exceptions/dbService.exception';
import { FollowTopic } from '../../domain/interfaces/customerFollows.interface';
import { CreateCustomerParams } from '../../usecases/interfaces/createCustomer.params';
import { Customer } from '../entities/customer.entity';

@Injectable()
export class CustomerProvider extends BaseComponent {
  constructor(
    @InjectRepository(Customer, 'customer-db')
    private readonly customersRepository: Repository<Customer>,
  ) {
    super(CustomerProvider.name);
  }

  get repo(): Repository<Customer> {
    return this.customersRepository;
  }

  async create(params: CreateCustomerParams): Promise<Customer> {
    const exists = await this.customersRepository.findOne({
      where: {
        userId: params.userId,
      },
    });

    if (exists) {
      throw new DbServiceBadRule(
        this,
        `Customer with user id: ${params.userId} already exist`,
      );
    }

    try {
      return await this.customersRepository.save({
        userId: params.userId,
        firstName: params.firstName,
        lastName: params.lastName,
        contactPhoneNumber: params.phoneNumber,
        contactEmail: params.contactEmail,
      });
    } catch (error) {
      throw new DBServiceCreateException(
        this,
        'Problems saving customer',
        error,
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
