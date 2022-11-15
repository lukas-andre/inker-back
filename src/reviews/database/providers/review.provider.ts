import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { REVIEW_DB_CONNECTION_NAME } from '../../../config/database/review.config';
import { Review } from '../entities/review.entity';

export class ReviewProvider {
  constructor(
    @InjectRepository(Review, REVIEW_DB_CONNECTION_NAME)
    private readonly repository: Repository<Review>,
  ) {}

  async findAll(params: number) {
    return params;
  }
}
