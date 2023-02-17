import { Column, Entity, Index } from 'typeorm';

import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';
import {
  defaultRatingMap,
  RatingRate,
  ReviewAvgInterface,
} from '../../interfaces/reviewAvg.interface';

@Entity()
export class ReviewAvg extends BaseEntity implements ReviewAvgInterface {
  @Column({ type: 'int', nullable: false, name: 'artist_id' })
  @Index()
  artistId: number;

  @Column({ type: 'real', nullable: false })
  value: number;

  @Column({
    type: 'jsonb',
    nullable: false,
    name: 'detail',
    default: defaultRatingMap,
  })
  detail: Record<RatingRate, number>;

  @Column({ type: 'int', nullable: false, name: 'count', default: 0 })
  count: number;
}
