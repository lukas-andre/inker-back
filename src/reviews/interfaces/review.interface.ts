import { BaseModelType } from '../../global/domain/models/base.model';

export type ReviewReactionDetailType = 'likes' | 'dislikes' | 'off';

export type ReviewReactionsDetail = {
  [key in ReviewReactionDetailType]: number;
};

export interface ReviewInterface extends BaseModelType {
  eventId: number;
  value?: number;
  content?: string;
  reviewReactions?: ReviewReactionsDetail;
  createdBy: number;
  isRated: boolean;
  artistId: number;
  displayName: string;
  header?: string;
}
