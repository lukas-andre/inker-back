import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber } from 'class-validator';

import { BaseDTO } from '../../global/domain/dtos/base.dto';
import { ReviewReactionEnum } from '../../reactions/domain/enums/reviewReaction.enum';
import { ReviewReactionInterface } from '../interfaces/reviewReaction.interface';

export class ReviewReactionDTO
  extends BaseDTO
  implements ReviewReactionInterface
{
  @ApiProperty({
    type: Number,
    description: 'The id of the user',
    example: 1,
  })
  customerId: number;

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
}
