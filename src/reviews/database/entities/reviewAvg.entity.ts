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

export const defaultRatingDetail: RatingDetail[] = [
  { rate: RatingRate.ONE, count: 0 },
  { rate: RatingRate.ONE_HALF, count: 0 },
  { rate: RatingRate.TWO, count: 0 },
  { rate: RatingRate.TWO_HALF, count: 0 },
  { rate: RatingRate.THREE, count: 0 },
  { rate: RatingRate.THREE_HALF, count: 0 },
  { rate: RatingRate.FOUR, count: 0 },
];

@Entity()
export class ReviewAvg extends BaseEntity {
  @Column({ type: 'int', nullable: false, name: 'artist_id' })
  @Index()
  artistId: number;

  @Column({ type: 'int', nullable: false, name: 'event_id' })
  @Index()
  eventId: number;

  @Column({ type: 'double precision', nullable: false })
  value: number;

  @Column({
    type: 'jsonb',
    nullable: false,
    name: 'detail',
    default: defaultRatingDetail,
  })
  detail: RatingDetail[];

  @Column({ type: 'int', nullable: false, name: 'count', default: 0 })
  count: number;
}
