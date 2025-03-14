import { Injectable } from '@nestjs/common';
import { WorkProvider } from '../../infrastructure/database/work.provider';
import { WorkDto } from '../../domain/dtos/work.dto';
import { BaseUseCase } from '../../../global/domain/usecases/base.usecase';

@Injectable()
export class GetWorksUseCase extends BaseUseCase {
  constructor(private readonly workProvider: WorkProvider) {
    super(GetWorksUseCase.name);
  }

  async execute(params: { artistId: number; onlyFeatured?: boolean }): Promise<WorkDto[]> {
    const { artistId, onlyFeatured } = params;
    
    if (onlyFeatured) {
      return this.workProvider.findFeaturedWorksByArtistId(artistId);
    }
    
    return this.workProvider.findWorksByArtistId(artistId);
  }
}