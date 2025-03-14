import { Injectable } from '@nestjs/common';
import { ArtistStyleProvider } from '../../infrastructure/database/artistStyle.provider';
import { BaseUseCase } from '../../../global/domain/usecases/base.usecase';

@Injectable()
export class RemoveArtistStyleUseCase extends BaseUseCase {
  constructor(private readonly artistStyleProvider: ArtistStyleProvider) {
    super(RemoveArtistStyleUseCase.name);
  }

  async execute(params: { artistId: number; styleName: string }): Promise<void> {
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