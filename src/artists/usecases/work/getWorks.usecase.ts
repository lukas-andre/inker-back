import { Injectable } from '@nestjs/common';
import { WorkProvider } from '../../infrastructure/database/work.provider';
import { WorkDto } from '../../domain/dtos/work.dto';
import { BaseUseCase } from '../../../global/domain/usecases/base.usecase';
import { WorkSource } from '../../domain/workType';

@Injectable()
export class GetWorksUseCase extends BaseUseCase {
  constructor(private readonly workProvider: WorkProvider) {
    super(GetWorksUseCase.name);
  }

  async execute(params: { 
    artistId: number; 
    onlyFeatured?: boolean;
    includeHidden?: boolean;
    source?: string;
  }): Promise<WorkDto[]> {
    const { artistId, onlyFeatured, includeHidden = false, source } = params;
    
    if (onlyFeatured) {
      return this.workProvider.findFeaturedWorksByArtistId(artistId, includeHidden, source as WorkSource);
    }
    
    return this.workProvider.findWorksByArtistId(artistId, includeHidden, source as WorkSource);
  }
}