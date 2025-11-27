import { BaseModelType } from '../../global/domain/models/base.model';
import { ReviewReactionEnum } from '../reviews.controller';

export interface ReviewReactionInterface extends BaseModelType {
  customerId: string;
  reactionType: ReviewReactionEnum;
  reviewId: string;
}

export interface CustomerReviewReactionDetailsResult {
  reviewReactionId: string;
  liked: boolean;
  disliked: boolean;
}
