import { Injectable } from '@nestjs/common';
import { ArtistStyleRepository } from '../../infrastructure/repositories/artistStyle.repository';
import { ArtistStyleDto, UpdateArtistStyleDto } from '../../domain/dtos/artistStyle.dto';
import { BaseUseCase } from '../../../global/domain/usecases/base.usecase';

@Injectable()
export class UpdateArtistStyleUseCase extends BaseUseCase {
  constructor(private readonly artistStyleProvider: ArtistStyleRepository) {
    super(UpdateArtistStyleUseCase.name);
  }

  async execute(params: {
    artistId: string;
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