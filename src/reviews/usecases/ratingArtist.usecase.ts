import { BaseUseCase } from '../../global/domain/usecases/base.usecase';

export class RatingArtistUsecase extends BaseUseCase {
  async execute(params: number) {
    return params;
  }
}
