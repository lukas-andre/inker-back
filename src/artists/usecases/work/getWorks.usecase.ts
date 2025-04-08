import { Injectable } from '@nestjs/common';
import { WorkRepository } from '../../infrastructure/repositories/work.repository';
import { WorkDto } from '../../domain/dtos/work.dto';
import { BaseUseCase } from '../../../global/domain/usecases/base.usecase';
import { WorkSource } from '../../domain/workType';
import { ContentMetricsEnricherService, WithMetrics, MetricsOptions } from '../../../analytics/infrastructure/services/content-metrics-enricher.service';
import { ContentType } from '../../../analytics/domain/enums/content-types.enum';

// Extended DTO that includes metrics
export interface WorkDtoWithMetrics extends WorkDto {
  metrics: {
    viewCount: number;
    likeCount: number;
  };
}

@Injectable()
export class GetWorksUseCase extends BaseUseCase {
  constructor(
    private readonly workProvider: WorkRepository,
    private readonly metricsEnricher: ContentMetricsEnricherService,
  ) {
    super(GetWorksUseCase.name);
  }

  async execute(params: { 
    artistId: string; 
    onlyFeatured?: boolean;
    includeHidden?: boolean;
    source?: string;
    includeMetrics?: boolean;
    userId?: string;
    disableCache?: boolean;
  }): Promise<(WorkDto & WithMetrics)[]> {
    const { 
      artistId, 
      onlyFeatured, 
      includeHidden = false, 
      source, 
      includeMetrics = true,
      userId,
      disableCache 
    } = params;
    
    let works: WorkDto[];
    
    if (onlyFeatured) {
      works = await this.workProvider.findFeaturedWorksByArtistId(artistId, includeHidden, source as WorkSource);
    } else {
      works = await this.workProvider.findWorksByArtistId(artistId, includeHidden, source as WorkSource);
    }

    const options: MetricsOptions = { disableCache };

    return includeMetrics
      ? await this.metricsEnricher.enrichAllWithMetrics(works, ContentType.WORK, userId, options)
      : this.metricsEnricher.addEmptyMetricsToAll(works);
  }
}