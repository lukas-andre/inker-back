import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber } from 'class-validator';

import {
  RatingRate,
  ReviewAvgInterface,
} from '../interfaces/reviewAvg.interface';

export class ReviewAvgDTO implements ReviewAvgInterface {
  @ApiProperty({
    type: Number,
    description: 'The id of the review',
    example: 1,
    required: true,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    type: Number,
    description: 'The id of the artist',
    example: 1,
    required: true,
  })
  @IsNumber()
  artistId: number;

  @ApiProperty({
    type: Number,
    description: 'The value of the review',
    example: 4.5,
  })
  @IsNumber()
  value: number;

  @ApiProperty({
    type: Object,
    description: 'The detail of the review',
    example: {
      1: 0,
      1.5: 0,
      2: 0,
      2.5: 0,
      3: 0,
      3.5: 0,
      4: 0,
      4.5: 1,
      5: 0,
    } as Record<RatingRate, number>,
  })
  detail: Record<RatingRate, number>;

  @ApiProperty({
    type: Number,
    description: 'The number of reviews',
    example: 1,
  })
  @IsNumber()
  count: number;

  @ApiProperty({
    type: Date,
    description: 'The date when the review was created',
    example: new Date(),
  })
  @IsDate()
  createdAt: Date;

  @ApiProperty({
    type: Date,
    description: 'The date when the review was updated',
    example: new Date(),
  })
  @IsDate()
  updatedAt: Date;
}
