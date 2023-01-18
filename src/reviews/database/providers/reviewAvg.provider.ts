import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { REVIEW_DB_CONNECTION_NAME } from '../../../databases/constants';
import { ReviewAvg } from '../entities/reviewAvg.entity';

@Injectable()
export class ReviewAvgProvider {
  constructor(
    @InjectRepository(ReviewAvg, REVIEW_DB_CONNECTION_NAME)
    private readonly repository: Repository<ReviewAvg>,
  ) {}

  get repo(): Repository<ReviewAvg> {
    return this.repository;
  }

  async findAll(params: number) {
    return params;
  }
}
