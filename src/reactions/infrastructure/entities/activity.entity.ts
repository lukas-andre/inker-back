import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';
import { ActivityTypeEnum } from '../enums/activity.enum';
import { ReactionTypeEnum } from '../enums/reaction.enum';

@Entity()
export class Activity extends BaseEntity {
  @Column({ name: 'activity_id' })
  activityId: number;

  @Column({ name: 'reaction_type', enum: ReactionTypeEnum })
  reactionType: ReactionTypeEnum;

  @Index()
  @Column({ name: 'activity_type', enum: ActivityTypeEnum })
  activityType: ActivityTypeEnum;

  @Column({ default: 0 })
  reactions: number;
}
