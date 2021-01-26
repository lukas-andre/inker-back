import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';
import { Entity, Column } from 'typeorm';
import { ReactionTypeEnum } from '../enums/reaction.enum';

@Entity()
export class Activity extends BaseEntity {
  @Column({ name: 'activity_id' })
  activityId: number;

  @Column({ name: 'reaction_type', enum: ReactionTypeEnum })
  reactionType: ReactionTypeEnum;

  @Column({ default: 0 })
  reactions: number;
}
