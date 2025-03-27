import { Injectable } from '@nestjs/common';
import { WorkProvider } from '../../infrastructure/database/work.provider';
import { WorkDto } from '../../domain/dtos/work.dto';
import { BaseUseCase } from '../../../global/domain/usecases/base.usecase';
import { WorkSource } from '../../domain/workType';
import { GetContentSummaryMetricsUseCase } from '../../../analytics/usecases/getContentSummaryMetrics.usecase';
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
    private readonly workProvider: WorkProvider,
    private readonly getContentSummaryMetricsUseCase: GetContentSummaryMetricsUseCase,
  ) {
    super(GetWorksUseCase.name);
  }

  async execute(params: { 
    artistId: number; 
    onlyFeatured?: boolean;
    includeHidden?: boolean;
    source?: string;
    includeMetrics?: boolean;
  }): Promise<WorkDtoWithMetrics[]> {
    const { artistId, onlyFeatured, includeHidden = false, source, includeMetrics = true } = params;
    
    let works: WorkDto[];
    
    if (onlyFeatured) {
      works = await this.workProvider.findFeaturedWorksByArtistId(artistId, includeHidden, source as WorkSource);
    } else {
      works = await this.workProvider.findWorksByArtistId(artistId, includeHidden, source as WorkSource);
    }

    // If no works or metrics not requested, return early
    if (!works.length || !includeMetrics) {
      return works.map(work => ({
        ...work,
        metrics: {
          viewCount: 0,
          likeCount: 0
        }
      }));
    }

    // Get all work IDs for batch lookup
    const workIds = works.map(work => work.id);
    
    // Fetch metrics for all works in a single batch query
    const metricsMap = await this.getContentSummaryMetricsUseCase.executeBatch(
      workIds, 
      ContentType.WORK
    );
    
    // Map the works with their metrics
    return works.map(work => ({
      ...work,
      metrics: metricsMap.get(work.id) || {
        viewCount: 0,
        likeCount: 0
      }
    }));
  }
}