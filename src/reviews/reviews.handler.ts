import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { BaseHandler } from '../global/infrastructure/base.handler';

import { ReviewArtistRequestDto } from './dtos/reviewArtistRequest.dto';
import { RatingArtistUsecase } from './usecases/ratingArtist.usecase';

@Injectable()
export class ReviewHandler extends BaseHandler {
  constructor(
    private readonly ratingArtistUseCase: RatingArtistUsecase,
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
}
