import { Injectable, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeepPartial,
  DeleteResult,
  FindManyOptions,
  FindOneOptions,
  Repository,
} from 'typeorm';

import { BaseComponent } from '../../../global/domain/components/base.component';
import { ExistsQueryResult } from '../../../global/domain/interfaces/existsQueryResult.interface';
import {
  DBServiceCreateException,
  DbServiceBadRule,
} from '../../../global/infrastructure/exceptions/dbService.exception';
import { AuthGuard } from '../../../global/infrastructure/guards/auth.guard';
import { FollowTopic } from '../../domain/interfaces/customerFollows.interface';
import { CreateCustomerParams } from '../../usecases/interfaces/createCustomer.params';
import { Customer } from '../entities/customer.entity';

@Injectable()
@UseGuards(AuthGuard)
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

  async searchByTerm(term: string): Promise<Customer[]> {
    return this.customersRepository
      .createQueryBuilder('customer')
      .where(
        `customer.tsv @@ plainto_tsquery('english', :term) 
              OR customer.tsv @@ plainto_tsquery('spanish', :term)`,
        { term },
      )
      .getMany();
  }

  async exists(id: number): Promise<boolean | undefined> {
    const [result]: ExistsQueryResult[] = await this.customersRepository.query(
      `SELECT EXISTS(SELECT 1 FROM customer c WHERE c.id = $1)`,
      [id],
    );

    return result.exists;
  }
}
