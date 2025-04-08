import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { BaseHandler } from '../global/infrastructure/base.handler';
import { RequestContextService } from '../global/infrastructure/services/requestContext.service';
import { ReviewReactionEnum } from './reviews.controller';

import { ReviewArtistRequestDto } from './dtos/reviewArtistRequest.dto';
import { GetReviewsFromArtistUsecase } from './usecases/getReviewsFromArtist.usecase';
import { RatingArtistUsecase } from './usecases/ratingArtist.usecase';
import { ReactToReviewUsecase } from './usecases/reactToReview.usecase';

@Injectable()
export class ReviewHandler extends BaseHandler {
  constructor(
    private readonly ratingArtistUseCase: RatingArtistUsecase,
    private readonly reactToReviewUseCase: ReactToReviewUsecase,
    private readonly getReviewsFromArtistUsecase: GetReviewsFromArtistUsecase,
    private readonly requestService: RequestContextService,
    private readonly jwtService: JwtService,
  ) {
    super(jwtService);
  }

  async reviewArtist(
    artistId: string,
    eventId: string,
    userId: string,
    body: ReviewArtistRequestDto,
  ) {
    return this.ratingArtistUseCase.execute(artistId, eventId, userId, body);
  }

  async reactToReview(
    reviewId: string,
    customerId: string,
    reaction: ReviewReactionEnum,
  ) {
    return this.reactToReviewUseCase.execute(reviewId, customerId, reaction);
  }

  async getReviewFromArtist(artistId: string, page: number, limit: number) {
    return this.getReviewsFromArtistUsecase.execute(
      this.requestService.userTypeId,
      artistId,
      page,
      limit,
    );
  }
}
