import { Injectable } from '@nestjs/common';

import { BaseUseCase } from '../../../global/domain/usecases/base.usecase';
import {
  ArtistStyleDto,
  CreateArtistStyleDto,
} from '../../domain/dtos/artistStyle.dto';
import { ArtistRepository } from '../../infrastructure/repositories/artist.repository';
import { ArtistStyleRepository } from '../../infrastructure/repositories/artistStyle.repository';

@Injectable()
export class AddArtistStyleUseCase extends BaseUseCase {
  constructor(
    private readonly artistStyleProvider: ArtistStyleRepository,
    private readonly artistProvider: ArtistRepository,
  ) {
    super(AddArtistStyleUseCase.name);
  }

  async execute(params: {
    artistId: string;
    dto: CreateArtistStyleDto;
  }): Promise<ArtistStyleDto> {
    const { artistId, dto } = params;

    const artist = await this.artistProvider.findById(artistId);
    if (!artist) {
      throw new Error('Artist not found');
    }

    const existingStyle = await this.artistStyleProvider.findArtistStyle(
      artistId,
      dto.styleName,
    );

    if (existingStyle) {
      throw new Error('Artist already has this style');
    }

    return this.artistStyleProvider.createArtistStyle(artistId, dto);
  }
}
