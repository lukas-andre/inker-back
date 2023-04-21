import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IPaginationMeta } from 'nestjs-typeorm-paginate';

import { CustomerReviewReactionDetailsDTO } from '../../locations/infrastructure/dtos/customerReviewReactionDetail.dto';
import { ReviewReactionsDetail } from '../interfaces/review.interface';

import { ReviewDto } from './review.dto';

export class GetReviewsFromArtistResponseDto {
  @ApiProperty({
    description: 'The reviews of the artist',
    example: [
      {
        id: 8,
        artistId: 1,
        eventId: 8,
        value: 5,
        header: 'This artist is awesome',
        content: 'This artist is excellent  4',
        createdBy: 7,
        displayName: 'Test 4',
        isRated: true,
        customerReactionDetail: {
          reviewReactionId: 7,
          liked: true,
          disliked: false,
        },
        reviewReactions: {
          likes: 1,
          dislikes: 0,
          off: 0,
        },
      } as GetReviewsFromArtistResponseReviewsDto,
    ],
    required: false,
  })
  items: GetReviewsFromArtistResponseReviewsDto[];
  @ApiProperty({
    description: 'The pagination meta',
    example: {
      totalItems: 7,
      itemCount: 5,
      itemsPerPage: 5,
      totalPages: 2,
      currentPage: 1,
    } as IPaginationMeta,
    required: false,
  })
  meta: IPaginationMeta;
}

export class GetReviewsFromArtistResponseReviewsDto extends ReviewDto {
  @Type(() => CustomerReviewReactionDetailsDTO)
  customerReactionDetail?: CustomerReviewReactionDetailsDTO;

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
}
