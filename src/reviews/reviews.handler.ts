import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { BaseHandler } from '../global/infrastructure/base.handler';
import { RequestService } from '../global/infrastructure/services/request.service';
import { ReviewReactionEnum } from '../reactions/domain/enums/reviewReaction.enum';

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
    private readonly requestService: RequestService,
    private readonly jwtService: JwtService,
  ) {
    super(jwtService);
  }

  async reviewArtist(
    artistId: number,
    eventId: number,
    userId: number,
    body: ReviewArtistRequestDto,
  ) {
    return this.ratingArtistUseCase.execute(artistId, eventId, userId, body);
  }

  async reactToReview(
    reviewId: number,
    customerId: number,
    reaction: ReviewReactionEnum,
  ) {
    return this.reactToReviewUseCase.execute(reviewId, customerId, reaction);
  }

  async getReviewFromArtist(artistId: number, page: number, limit: number) {
    return this.getReviewsFromArtistUsecase.execute(
      this.requestService.userTypeId,
      artistId,
      page,
      limit,
    );
  }
}
