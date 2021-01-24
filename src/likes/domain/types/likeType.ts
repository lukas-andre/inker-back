import { BaseModelType } from 'src/global/domain/models/base.model';

export type LikeProps =
  | 'id'
  | 'type'
  | 'active'
  | 'activityId'
  | 'userId'
  | 'created_at'
  | 'updated_at';

export type Like = {
  type: string;
  active: string;
  activityId: string;
  userId: string;
} & BaseModelType;
