import { Column, Entity, Index } from 'typeorm';

import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';

export interface ReviewReactionsDetail {
  likes: number;
  dislikes: number;
}

export enum ReviewReactionType {
  LIKE = 'like',
  DISLIKE = 'dislike',
}

@Entity()
export class Review extends BaseEntity {
  @Column({ type: 'int', nullable: false, name: 'artist_id' })
  @Index()
  artistId: number;

  @Column({ type: 'int', nullable: false, name: 'event_id' })
  @Index()
  eventId: number;

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
    default: {},
    name: 'review_reactions',
  })
  reviewReactions?: ReviewReactionsDetail[];

  @Column({ type: 'int', nullable: false, name: 'created_by' })
  createdBy: number;

  @Column({ nullable: false, name: 'display_name' })
  displayName: string;

  @Column({ default: false, name: 'is_rated' })
  isRated: boolean;
}
