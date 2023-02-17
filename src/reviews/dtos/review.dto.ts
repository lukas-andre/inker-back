import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDate, IsNumber, IsString } from 'class-validator';

import {
  ReviewInterface,
  ReviewReactionsDetail,
} from '../interfaces/review.interface';

export class ReviewDto implements ReviewInterface {
  @ApiProperty({ type: Number, description: 'The id of the event', example: 1 })
  @IsNumber()
  eventId: number;

  @ApiProperty({
    type: Number,
    description: 'The value of the review',
    example: 4.5,
    required: false,
  })
  @IsNumber()
  value?: number;

  @ApiProperty({
    type: String,
    description: 'The content of the review',
    example: 'This is a review',
    required: false,
  })
  @IsString()
  content?: string;

  @ApiProperty({
    type: Object,
    description: 'The reactions of the review',
    example: {
      dislikes: 0,
      likes: 0,
    } as ReviewReactionsDetail,
    required: false,
  })
  reviewReactions?: ReviewReactionsDetail;

  @ApiProperty({
    type: Number,
    description: 'The id of the customer that created the review',
    example: 1,
    required: true,
  })
  @IsNumber()
  createdBy: number;

  @ApiProperty({
    type: String,
    description: 'Flag to know if the review is rated',
    example: true,
  })
  @IsBoolean()
  isRated: boolean;

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
    type: String,
    description: 'The display name of the customer',
    example: 'John Doe',
    required: true,
  })
  displayName: string;

  @ApiProperty({
    type: String,
    description: 'The header of the review',
    example: 'This is a review',
    required: false,
  })
  @IsString()
  header?: string;

  @ApiProperty({
    type: Date,
    description: 'The date when the review was created',
    example: new Date(),
    required: true,
  })
  @IsDate()
  createdAt: Date;

  @ApiProperty({
    type: Date,
    description: 'The date when the review was updated',
    example: new Date(),
    required: true,
  })
  updatedAt: Date;
}
