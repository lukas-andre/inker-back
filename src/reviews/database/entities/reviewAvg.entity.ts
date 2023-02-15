import { Column, Entity, Index } from 'typeorm';

import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';

export enum RatingRate {
  ONE = 1,
  ONE_HALF = 1.5,
  TWO = 2,
  TWO_HALF = 2.5,
  THREE = 3,
  THREE_HALF = 3.5,
  FOUR = 4,
  FOUR_HALF = 4.5,
  FIVE = 5,
}

export interface RatingDetail {
  rate: RatingRate;
  count: number;
}

export const defaultRatingMap: Record<RatingRate, number> = {
  [RatingRate.ONE]: 0,
  [RatingRate.ONE_HALF]: 0,
  [RatingRate.TWO]: 0,
  [RatingRate.TWO_HALF]: 0,
  [RatingRate.THREE]: 0,
  [RatingRate.THREE_HALF]: 0,
  [RatingRate.FOUR]: 0,
  [RatingRate.FOUR_HALF]: 0,
  [RatingRate.FIVE]: 0,
};

@Entity()
export class ReviewAvg extends BaseEntity {
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
