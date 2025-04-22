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
export class CustomerRepository extends BaseComponent {
  constructor(
    @InjectRepository(Customer, 'customer-db')
    private readonly customersRepository: Repository<Customer>,
  ) {
    super(CustomerRepository.name);
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
      // Create a new customer with tsv properly generated and return JSON in camelCase
      const searchText = `${params.firstName || ''} ${params.lastName || ''} ${params.contactEmail || ''}`;
      
      const result = await this.customersRepository.query(
        `INSERT INTO "customer"("user_id", "first_name", "last_name", "contact_email", "contact_phone_number", "tsv")
         VALUES ($1, $2, $3, $4, $5, to_tsvector('english', $6))
         RETURNING json_build_object(
           'id', id,
           'createdAt', created_at,
           'updatedAt', updated_at,
           'userId', user_id,
           'firstName', first_name,
           'lastName', last_name,
           'contactEmail', contact_email,
           'contactPhoneNumber', contact_phone_number,
           'shortDescription', short_description,
           'profileThumbnail', profile_thumbnail,
           'follows', follows,
           'rating', rating,
           'tsv', tsv,
           'deletedAt', deleted_at
         ) as customer`,
        [
          params.userId,
          params.firstName,
          params.lastName,
          params.contactEmail,
          params.phoneNumber,
          searchText
        ]
      );
      
      const customerData = result[0].customer;
      const customer = Object.assign(new Customer(), customerData);
      
        return customer;
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

  async findById(id: string) {
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

  async exists(id: string): Promise<boolean | undefined> {
    const [result]: ExistsQueryResult[] = await this.customersRepository.query(
      `SELECT EXISTS(SELECT 1 FROM customer c WHERE c.id = $1)`,
      [id],
    );

    return result.exists;
  }
}
