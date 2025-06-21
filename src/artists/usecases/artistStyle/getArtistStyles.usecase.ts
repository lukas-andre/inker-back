import { Injectable } from '@nestjs/common';

import { BaseUseCase } from '../../../global/domain/usecases/base.usecase';
import { ArtistStyleDto } from '../../domain/dtos/artistStyle.dto';
import { ArtistStyleRepository } from '../../infrastructure/repositories/artistStyle.repository';

@Injectable()
export class GetArtistStylesUseCase extends BaseUseCase {
  constructor(private readonly artistStyleProvider: ArtistStyleRepository) {
    super(GetArtistStylesUseCase.name);
  }

  async execute(params: { artistId: string }): Promise<ArtistStyleDto[]> {
    const { artistId } = params;
    return this.artistStyleProvider.findStylesByArtistId(artistId);
  }
}
