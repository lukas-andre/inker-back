import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

import { CustomerReviewReactionDetailsResult } from '../../../reviews/interfaces/reviewReaction.interface';

export class CustomerReviewReactionDetailsDTO
  implements CustomerReviewReactionDetailsResult
{
  @ApiProperty({ description: 'Review reaction id', example: '1' })
  @IsString()
  reviewReactionId: string;

  @ApiProperty({ description: 'liked or not', example: true })
  @IsBoolean()
  liked: boolean;

  @ApiProperty({ description: 'disliked or not', example: false })
  @IsBoolean()
  disliked: boolean;
}
