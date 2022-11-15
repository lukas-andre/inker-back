import { RatingArtistUsecase } from './usecases/ratingArtist.usecase';

export class RatingHandler {
  constructor(private readonly ratingService: RatingArtistUsecase) {}

  async findAll(params: number) {
    return params;
  }
}
