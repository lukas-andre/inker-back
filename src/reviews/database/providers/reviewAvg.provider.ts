import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { REVIEW_DB_CONNECTION_NAME } from '../../../databases/constants';
import { BaseComponent } from '../../../global/domain/components/base.component';
import { DBServiceFindException } from '../../../global/infrastructure/exceptions/dbService.exception';
import { RatingRate } from '../../interfaces/reviewAvg.interface';
import { ReviewAvg } from '../entities/reviewAvg.entity';

export interface ReviewAvgByArtistIdsResult {
  artistId: number;
  count: number;
  detail: Record<RatingRate, number>;
  value: number;
}

@Injectable()
export class ReviewAvgProvider extends BaseComponent {
  constructor(
    @InjectRepository(ReviewAvg, REVIEW_DB_CONNECTION_NAME)
    private readonly repository: Repository<ReviewAvg>,
  ) {
    super(ReviewAvgProvider.name);
  }

  get repo(): Repository<ReviewAvg> {
    return this.repository;
  }

  async findByArtistId(artistId: number) {
    return await this.repo.findOne({ where: { artistId } });
  }

  async findAll(params: number) {
    return params;
  }

  async findAvgByArtistIds(
    artistIds: number[],
  ): Promise<ReviewAvgByArtistIdsResult[]> {
    try {
      return await this.repo.find({
        select: ['count', 'detail', 'value', 'artistId'],
        where: { artistId: In(artistIds) },
      });
    } catch (error) {
      throw new DBServiceFindException(
        this,
        this.findAvgByArtistIds.name,
        error,
      );
    }
  }
}
