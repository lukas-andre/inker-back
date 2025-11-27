import { Injectable } from '@nestjs/common';

import { BaseUseCase } from '../../../global/domain/usecases/base.usecase';
import { ArtistStyleRepository } from '../../infrastructure/repositories/artistStyle.repository';

@Injectable()
export class RemoveArtistStyleUseCase extends BaseUseCase {
  constructor(private readonly artistStyleProvider: ArtistStyleRepository) {
    super(RemoveArtistStyleUseCase.name);
  }

  async execute(params: {
    artistId: string;
    styleName: string;
  }): Promise<void> {
    const { artistId, styleName } = params;

    const existingStyle = await this.artistStyleProvider.findArtistStyle(
      artistId,
      styleName,
    );

    if (!existingStyle) {
      throw new Error('Artist style not found');
    }

    await this.artistStyleProvider.deleteArtistStyle(artistId, styleName);
  }
}
