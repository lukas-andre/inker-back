import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { z } from 'zod';

import { REVIEW_DB_CONNECTION_NAME } from '../../../databases/constants';
import { ReviewReactionEnum } from '../../../reactions/domain/enums/reviewReaction.enum';
import { ReviewReaction } from '../entities/reviewReaction.entity';

export interface CustomerReviewReactionDetailsResult {
  reviewReactionId: number;
  liked: boolean;
  disliked: boolean;
}
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
    customerId: number,
  ): Promise<ReviewReactionEnum | undefined> {
    const [result]: { reactionType: ReviewReactionEnum }[] =
      await this.repo.query(
        `SELECT  reaction_type AS "reactionType" FROM review_reaction WHERE review_id = $1 AND customer_id = $2`,
        [reviewId, customerId],
      );
    return result ? result.reactionType : undefined;
  }

  async findCustomerReviewsReactionDetail(
    customerId: number,
    customerReviewsId: number[],
  ): Promise<Map<number, CustomerReviewReactionDetailsResult>> {
    const QueryResultSchema = z.object({
      reviewReactionId: z.number(),
      reviewId: z.number(),
      reactionType: z.enum([
        ReviewReactionEnum.like,
        ReviewReactionEnum.dislike,
        ReviewReactionEnum.off,
      ]),
    });

    type QueryResult = z.infer<typeof QueryResultSchema>;

    const result: QueryResult[] = await this.repo.query(
      `SELECT id AS "reviewReactionId", review_id AS "reviewId", reaction_type as "reactionType" FROM review_reaction WHERE customer_id = $1 AND review_id = ANY($2)`,
      [customerId, customerReviewsId],
    );

    const parsedResult = result.map(r => QueryResultSchema.parse(r));
    const resultMap = new Map<number, CustomerReviewReactionDetailsResult>();

    for (const { reviewId, reactionType, reviewReactionId } of parsedResult) {
      if (reactionType === ReviewReactionEnum.off) {
        continue;
      }

      const currentResult = resultMap.get(reviewId) ?? {
        reviewReactionId,
        liked: false,
        disliked: false,
      };

      if (reactionType === ReviewReactionEnum.like) {
        currentResult.liked = true;
      }

      if (reactionType === ReviewReactionEnum.dislike) {
        currentResult.disliked = true;
      }

      resultMap.set(reviewId, currentResult);
    }

    return resultMap;
  }
}
