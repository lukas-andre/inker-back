import { RatingArtistUsecase } from './usecases/ratingArtist.usecase';

export class ReviewHandler {
  constructor(private readonly ratingArtistUseCase: RatingArtistUsecase) {}

  async findAll(params: number) {
    return params;
  }
}
