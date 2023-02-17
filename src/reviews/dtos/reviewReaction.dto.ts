import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEnum, IsNumber } from 'class-validator';

import { ReviewReactionEnum } from '../../reactions/domain/enums/reviewReaction.enum';
import { ReviewReactionInterface } from '../interfaces/reviewReaction.interface';

export class ReviewReactionDTO implements ReviewReactionInterface {
  @ApiProperty({
    type: Number,
    description: 'The id of the reaction',
    example: 1,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    type: Number,
    description: 'The id of the user',
    example: 1,
  })
  userId: number;

  @ApiProperty({
    type: String,
    description: 'The type of the reaction',
    example: ReviewReactionEnum.like,
  })
  @IsEnum(ReviewReactionEnum)
  reactionType: ReviewReactionEnum;

  @ApiProperty({
    type: Number,
    description: 'The id of the review',
    example: 1,
  })
  @IsNumber()
  reviewId: number;

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
