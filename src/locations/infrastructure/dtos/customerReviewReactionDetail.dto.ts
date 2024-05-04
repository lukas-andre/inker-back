import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber } from 'class-validator';

import { CustomerReviewReactionDetailsResult } from '../../../reviews/database/providers/reviewReaction.provider';

export class CustomerReviewReactionDetailsDTO
  implements CustomerReviewReactionDetailsResult
{
  @ApiProperty({ description: 'Review reaction id', example: 1 })
  @IsNumber()
  reviewReactionId: number;

  @ApiProperty({ description: 'liked or not', example: true })
  @IsBoolean()
  liked: boolean;

  @ApiProperty({ description: 'disliked or not', example: false })
  @IsBoolean()
  disliked: boolean;
}
