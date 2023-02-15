import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { BaseHandler } from '../global/infrastructure/base.handler';
import { ReviewReactionEnum } from '../reactions/domain/enums/reviewReaction.enum';

import { ReviewArtistRequestDto } from './dtos/reviewArtistRequest.dto';
import { RatingArtistUsecase } from './usecases/ratingArtist.usecase';
import { ReactToReviewUsecase } from './usecases/reactToReview.usecase';

@Injectable()
export class ReviewHandler extends BaseHandler {
  constructor(
    private readonly ratingArtistUseCase: RatingArtistUsecase,
    private readonly reactToReviewUseCase: ReactToReviewUsecase,
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
    userId: number,
    reaction: ReviewReactionEnum,
  ) {
    return this.reactToReviewUseCase.execute(reviewId, userId, reaction);
  }
}
