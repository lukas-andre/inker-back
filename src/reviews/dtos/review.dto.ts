import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

import { BaseDTO } from '../../global/domain/dtos/base.dto';
import {
  ReviewInterface,
  ReviewReactionsDetail,
} from '../interfaces/review.interface';

export class ReviewDto extends BaseDTO implements ReviewInterface {
  @ApiProperty({
    type: String,
    description: 'The id of the event',
    example: '1',
  })
  @IsString()
  eventId: string;

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
  @IsString()
  createdBy: string;

  @ApiProperty({
    type: Boolean,
    description: 'Flag to know if the review is rated',
    example: true,
  })
  @IsBoolean()
  isRated: boolean;

  @ApiProperty({
    type: String,
    description: 'The id of the artist',
    example: '1',
    required: true,
  })
  @IsString()
  artistId: string;

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
}
