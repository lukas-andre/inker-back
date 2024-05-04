import { BaseModelType } from '../../global/domain/models/base.model';
import { ReviewReactionEnum } from '../../reactions/domain/enums/reviewReaction.enum';

export interface ReviewReactionInterface extends BaseModelType {
  customerId: number;
  reactionType: ReviewReactionEnum;
  reviewId: number;
}
