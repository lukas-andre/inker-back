import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';
import { Entity, Column, Index } from 'typeorm';

export enum LikeTypeEnum {
  COMMENT,
  POST,
}

@Entity()
export class Like extends BaseEntity {
  @Index()
  @Column({ enum: LikeTypeEnum })
  type: LikeTypeEnum;

  @Index()
  @Column()
  active: boolean;

  @Index()
  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'activity_id' })
  activityId: string;
}
