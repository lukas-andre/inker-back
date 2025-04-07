import { Injectable } from '@nestjs/common';
import { ArtistStyleProvider } from '../../infrastructure/database/artistStyle.provider';
import { ArtistStyleDto, UpdateArtistStyleDto } from '../../domain/dtos/artistStyle.dto';
import { BaseUseCase } from '../../../global/domain/usecases/base.usecase';

@Injectable()
export class UpdateArtistStyleUseCase extends BaseUseCase {
  constructor(private readonly artistStyleProvider: ArtistStyleProvider) {
    super(UpdateArtistStyleUseCase.name);
  }

  async execute(params: {
    artistId: number;
    styleName: string;
    dto: UpdateArtistStyleDto;
  }): Promise<ArtistStyleDto> {
    const { artistId, styleName, dto } = params;
    
    const existingStyle = await this.artistStyleProvider.findArtistStyle(
      artistId,
      styleName,
    );
    
    if (!existingStyle) {
      throw new Error('Artist style not found');
    }
    
    return this.artistStyleProvider.updateArtistStyle(artistId, styleName, dto);
  }
}