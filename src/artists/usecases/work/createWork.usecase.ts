import { Injectable } from '@nestjs/common';
import { WorkProvider } from '../../infrastructure/database/work.provider';
import { CreateWorkDto, WorkDto } from '../../domain/dtos/work.dto';
import { Artist } from '../../infrastructure/entities/artist.entity';
import { ArtistProvider } from '../../infrastructure/database/artist.provider';
import { BaseUseCase } from '../../../global/domain/usecases/base.usecase';

@Injectable()
export class CreateWorkUseCase extends BaseUseCase {
  constructor(
    private readonly workProvider: WorkProvider,
    private readonly artistProvider: ArtistProvider,
  ) {
    super(CreateWorkUseCase.name);
  }

  async execute(params: { artist: Artist; dto: CreateWorkDto }): Promise<WorkDto> {
    const { artist, dto } = params;
    
    const existingArtist = await this.artistProvider.findById(artist.id);
    if (!existingArtist) {
      throw new Error('Artist not found');
    }

    const work = await this.workProvider.createWork(artist.id, dto);
    
    return work;
  }
}