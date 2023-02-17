import { Column, Entity, Index } from 'typeorm';

import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';
import { ReviewReactionEnum } from '../../../reactions/domain/enums/reviewReaction.enum';
import { ReviewReactionInterface } from '../../interfaces/reviewReaction.interface';

@Entity()
export class ReviewReaction
  extends BaseEntity
  implements ReviewReactionInterface
{
  @Column({ name: 'user_id' })
  @Index()
  userId: number;

  @Column({
    type: 'enum',
    name: 'reaction_type',
    enumName: 'reaction_type_enum',
    enum: ReviewReactionEnum,
  })
  reactionType: ReviewReactionEnum;

  @Column({ name: 'review_id' })
  @Index()
  reviewId: number;
}
