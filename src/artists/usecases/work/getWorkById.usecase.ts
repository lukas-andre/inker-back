import { Injectable } from '@nestjs/common';
import { WorkProvider } from '../../infrastructure/database/work.provider';
import { WorkDto } from '../../domain/dtos/work.dto';
import { BaseUseCase } from '../../../global/domain/usecases/base.usecase';
import { ContentMetricsEnricherService, WithMetrics, MetricsOptions } from '../../../analytics/infrastructure/services/content-metrics-enricher.service';
import { ContentType } from '../../../analytics/domain/enums/content-types.enum';

@Injectable()
export class GetWorkByIdUseCase extends BaseUseCase {
  constructor(
    private readonly workProvider: WorkProvider,
    private readonly metricsEnricher: ContentMetricsEnricherService,
  ) {
    super(GetWorkByIdUseCase.name);
  }

  async execute(params: { 
    id: number; 
    includeMetrics?: boolean; 
    userId?: number;
    disableCache?: boolean; 
  }): Promise<(WorkDto & WithMetrics) | null> {
    const { id, includeMetrics = true, userId, disableCache } = params;
    const work = await this.workProvider.findWorkById(id);
    
    if (!work) {
      return null;
    }
    
    const options: MetricsOptions = { disableCache };
    
    return includeMetrics 
      ? await this.metricsEnricher.enrichWithMetrics(work, ContentType.WORK, userId, options)
      : this.metricsEnricher.addEmptyMetrics(work);
  }
}