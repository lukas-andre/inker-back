import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { REVIEW_DB_CONNECTION_NAME } from '../../../databases/constants';
import { ReviewReactionEnum } from '../../../reactions/domain/enums/reviewReaction.enum';
import { ReviewReaction } from '../entities/reviewReaction.entity';

@Injectable()
export class ReviewReactionProvider {
  constructor(
    @InjectRepository(ReviewReaction, REVIEW_DB_CONNECTION_NAME)
    private readonly repository: Repository<ReviewReaction>,
  ) {}

  get repo(): Repository<ReviewReaction> {
    return this.repository;
  }

  async getReviewReactionIfExists(
    reviewId: number,
  ): Promise<ReviewReactionEnum | undefined> {
    const [result]: { reactionType: ReviewReactionEnum }[] =
      await this.repo.query(
        `SELECT  reaction_type AS "reactionType" FROM review_reaction WHERE review_id = $1`,
        [reviewId],
      );
    return result ? result.reactionType : undefined;
  }
}
