import { Injectable } from '@nestjs/common';
import { ArtistStyleProvider } from '../../infrastructure/database/artistStyle.provider';
import { ArtistStyleDto } from '../../domain/dtos/artistStyle.dto';
import { BaseUseCase } from '../../../global/domain/usecases/base.usecase';

@Injectable()
export class GetArtistStylesUseCase extends BaseUseCase {
  constructor(private readonly artistStyleProvider: ArtistStyleProvider) {
    super(GetArtistStylesUseCase.name);
  }

  async execute(params: { artistId: number }): Promise<ArtistStyleDto[]> {
    const { artistId } = params;
    return this.artistStyleProvider.findStylesByArtistId(artistId);
  }
}