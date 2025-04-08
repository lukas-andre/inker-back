import { BaseModelType } from '../../global/domain/models/base.model';

export type ReviewReactionDetailType = 'likes' | 'dislikes' | 'off';

export type ReviewReactionsDetail = {
  [key in ReviewReactionDetailType]: number;
};

export interface ReviewInterface extends BaseModelType {
  eventId: string;
  value?: number;
  content?: string;
  reviewReactions?: ReviewReactionsDetail;
  createdBy: string;
  isRated: boolean;
  artistId: string;
  displayName: string;
  header?: string;
}
