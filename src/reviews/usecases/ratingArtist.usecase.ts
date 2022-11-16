import {
  BaseUseCase,
  UseCase,
} from '../../global/domain/usecases/base.usecase';

export class RatingArtistUsecase extends BaseUseCase implements UseCase {
  constructor() {
    super(RatingArtistUsecase.name);
  }

  async execute(params: number) {
    return;
  }
}
