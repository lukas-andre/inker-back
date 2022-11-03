import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeepPartial,
  DeleteResult,
  FindManyOptions,
  FindOneOptions,
  Repository,
} from 'typeorm';

import { CustomerFeed } from './customerFeed.entity';

@Injectable()
export class CustomerService {
  private readonly serviceName: string = CustomerService.name;

  constructor(
    @InjectRepository(CustomerFeed, 'feed-db')
    private readonly customerFeedRepository: Repository<CustomerFeed>,
  ) {}

  async findById(id: number) {
    return this.customerFeedRepository.findOne({ where: { id } });
  }

  async find(options: FindManyOptions<CustomerFeed>) {
    return this.customerFeedRepository.find(options);
  }

  async findAndCount(options: FindManyOptions<CustomerFeed>) {
    return this.customerFeedRepository.findAndCount(options);
  }

  async findOne(
    options?: FindOneOptions<CustomerFeed>,
  ): Promise<CustomerFeed | undefined> {
    return this.customerFeedRepository.findOne(options);
  }

  async save(feed: DeepPartial<CustomerFeed>): Promise<CustomerFeed> {
    return this.customerFeedRepository.save(feed);
  }

  async delete(id: string): Promise<DeleteResult> {
    return this.customerFeedRepository.delete(id);
  }
}
