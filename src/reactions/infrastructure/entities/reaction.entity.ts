import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';
import { Entity, Column, Index } from 'typeorm';
import { ReactionTypeEnum } from '../enums/reaction.enum';
import { ActivityTypeEnum } from '../enums/activity.enum';

@Entity()
export class Reaction extends BaseEntity {
  @Index()
  @Column({ name: 'activity_id' })
  activityId: number;

  @Index()
  @Column({ name: 'activity_type', enum: ActivityTypeEnum })
  activityType: ActivityTypeEnum;

  @Index()
  @Column({ name: 'reaction_type', enum: ReactionTypeEnum })
  reactionType: ReactionTypeEnum;

  @Index()
  @Column()
  active: boolean;

  @Column()
  location: string;
  // TODO: ESTO  LO ESTOY GUARDANDO MUCHAS VECES EN MUCHAS ENTIDADES, TAL VEZ SE PODRIA AGREGAR CON UNA ESPECIE DE GRAPH
  @Index()
  @Column({ name: 'user_id' })
  userId: number;

  @Index()
  @Column({ name: 'user_type_id' })
  userTypeId: number;

  @Column({ name: 'user_type' })
  userType: string;

  @Column({ name: 'profile_thumbnail', nullable: true })
  profileThumbnail: string;

  @Column()
  username: string;
}
