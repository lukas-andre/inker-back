import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';
import { User } from '../../../users/infrastructure/entities/user.entity';
import { InteractionType } from '../../domain/interactionType';

@Entity('interactions')
@Index(['entityType', 'entityId'])
@Index(['interactionType'])
export class Interaction extends BaseEntity implements InteractionType {
  @Column({ name: 'user_id' })
  @Index()
  userId: number;

  @Column({ name: 'interaction_type' })
  interactionType: string; // 'view', 'like', 'save', 'share'

  @Column({ name: 'entity_type' })
  entityType: string; // 'artist', 'work', 'stencil'

  @Column({ name: 'entity_id' })
  entityId: number;
}