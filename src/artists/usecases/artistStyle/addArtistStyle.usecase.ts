import { Injectable } from '@nestjs/common';
import { ArtistStyleProvider } from '../../infrastructure/database/artistStyle.provider';
import { ArtistStyleDto, CreateArtistStyleDto } from '../../domain/dtos/artistStyle.dto';
import { ArtistProvider } from '../../infrastructure/database/artist.provider';
import { BaseUseCase } from '../../../global/domain/usecases/base.usecase';

@Injectable()
export class AddArtistStyleUseCase extends BaseUseCase {
  constructor(
    private readonly artistStyleProvider: ArtistStyleProvider,
    private readonly artistProvider: ArtistProvider,
  ) {
    super(AddArtistStyleUseCase.name);
  }

  async execute(params: { artistId: number; dto: CreateArtistStyleDto }): Promise<ArtistStyleDto> {
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