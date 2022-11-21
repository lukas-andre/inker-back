import { Injectable } from '@nestjs/common';
import {
  InjectDataSource,
  InjectEntityManager,
  InjectRepository,
} from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';

import { REVIEW_DB_CONNECTION_NAME } from '../../../config/database/review.config';
import { Review } from '../entities/review.entity';

@Injectable()
export class ReviewProvider {
  constructor(
    @InjectRepository(Review, REVIEW_DB_CONNECTION_NAME)
    private readonly repository: Repository<Review>,
    @InjectDataSource(REVIEW_DB_CONNECTION_NAME)
    private readonly dataSource: DataSource,
    @InjectEntityManager(REVIEW_DB_CONNECTION_NAME)
    private readonly entityManager: EntityManager,
  ) {}

  get source(): DataSource {
    return this.dataSource;
  }

  get manager(): EntityManager {
    return this.entityManager;
  }

  get repo(): Repository<Review> {
    return this.repository;
  }

  async findAll(params: number) {
    return params;
  }
}
