import { Column, Entity, Index } from 'typeorm';

import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';

export enum ReactionType {
  LIKE = 'like',
  DISLIKE = 'dislike',
  OFF = 'off',
}

@Entity()
export class ReviewReaction extends BaseEntity {
  @Column({ name: 'user_id' })
  @Index()
  userId: number;

  @Column({
    type: 'enum',
    name: 'reaction_type',
    enumName: 'reaction_type_enum',
    enum: ReactionType,
  })
  reactionType: ReactionType;

  @Column({ name: 'rating_id' })
  @Index()
  ratingId: number;
}
