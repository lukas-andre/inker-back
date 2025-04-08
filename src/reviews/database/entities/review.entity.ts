import { Column, Entity, Index } from 'typeorm';

import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';
import {
  ReviewInterface,
  ReviewReactionsDetail,
} from '../../interfaces/review.interface';

@Entity()
@Index(['artistId', 'eventId'])
export class Review extends BaseEntity implements ReviewInterface {
  @Column({ nullable: false, name: 'artist_id' })
  @Index()
  artistId: string;

  @Column({ nullable: false, name: 'event_id' })
  @Index()
  eventId: string;

  @Column({ type: 'real', nullable: true, name: 'value' })
  value?: number;

  @Column({
    type: 'varchar',
    length: 30,
    nullable: true,
    name: 'header',
  })
  header?: string;

  @Column({ nullable: true })
  content?: string;

  @Column({
    type: 'jsonb',
    nullable: false,
    default: {
      dislikes: 0,
      likes: 0,
    } as ReviewReactionsDetail,
    name: 'review_reactions',
  })
  reviewReactions?: ReviewReactionsDetail;

  @Column({ nullable: false, name: 'created_by' })
  createdBy: string;

  @Column({ nullable: false, name: 'display_name' })
  displayName: string;

  @Column({ default: false, name: 'is_rated' })
  isRated: boolean;
}
