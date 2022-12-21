import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { REVIEW_DB_CONNECTION_NAME } from '../../../databases/database.module';
import { ReviewAvg } from '../entities/reviewAvg.entity';

@Injectable()
export class ReviewAvgProvider {
  constructor(
    @InjectRepository(ReviewAvg, REVIEW_DB_CONNECTION_NAME)
    private readonly repository: Repository<ReviewAvg>,
  ) {}

  repo(): Repository<ReviewAvg> {
    return this.repository;
  }

  async findAll(params: number) {
    return params;
  }
}
