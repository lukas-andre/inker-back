import { Column, Entity, Index } from 'typeorm';

import { BaseEntity } from '../global/infrastructure/entities/base.entity';

import { CustomerFeedInterface } from './customerFeed.interface';

@Entity()
export class CustomerFeed extends BaseEntity {
  @Index()
  @Column()
  userId: string;

  @Column({ type: 'jsonb' })
  feed: CustomerFeedInterface;

  @Column({ default: 50 })
  maxItems: number;
}
