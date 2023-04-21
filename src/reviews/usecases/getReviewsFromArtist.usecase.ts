import { Injectable } from '@nestjs/common';
import { IPaginationMeta, Pagination } from 'nestjs-typeorm-paginate';
import { O } from 'ts-toolbelt';

import {
  BaseUseCase,
  UseCase,
} from '../../global/domain/usecases/base.usecase';
import { Review } from '../database/entities/review.entity';
import { ReviewProvider } from '../database/providers/review.provider';
import { ReviewReactionProvider } from '../database/providers/reviewReaction.provider';
import { GetReviewsFromArtistResponseDto } from '../dtos/getReviewsFromArtistResponse.dto';

type WritableResult = O.Writable<Pagination<Review, IPaginationMeta>>;

@Injectable()
export class GetReviewsFromArtistUsecase
  extends BaseUseCase
  implements UseCase
{
  constructor(
    private readonly reviewProvider: ReviewProvider,
    private readonly reviewReactionProvider: ReviewReactionProvider,
  ) {
    super(GetReviewsFromArtistUsecase.name);
  }

  async execute(
    customerId: number,
    artistId: number,
    page: number,
    limit: number,
  ): Promise<GetReviewsFromArtistResponseDto> {
    const result = await this.reviewProvider.paginate(artistId, {
      page,
      limit,
    });

    const reviews = result as WritableResult;

    if (customerId) {
      const customerReviewReactionDetail =
        await this.reviewReactionProvider.findCustomerReviewsReactionDetail(
          customerId,
          reviews.items.map(review => review.id),
        );

      reviews.items = reviews.items.map(review => {
        const customerReactionDetail = customerReviewReactionDetail.get(
          review.id,
        );

        return {
          ...review,
          customerReactionDetail,
        };
      });
    }

    return reviews;
  }
}
