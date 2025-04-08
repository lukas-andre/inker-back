import { Injectable } from '@nestjs/common';
import { WorkRepository } from '../../infrastructure/repositories/work.repository';
import { WorkDto } from '../../domain/dtos/work.dto';
import { BaseUseCase } from '../../../global/domain/usecases/base.usecase';
import { ContentMetricsEnricherService, WithMetrics, MetricsOptions } from '../../../analytics/infrastructure/services/content-metrics-enricher.service';
import { ContentType } from '../../../analytics/domain/enums/content-types.enum';

@Injectable()
export class GetWorkByIdUseCase extends BaseUseCase {
  constructor(
    private readonly workProvider: WorkRepository,
    private readonly metricsEnricher: ContentMetricsEnricherService,
  ) {
    super(GetWorkByIdUseCase.name);
  }

  async execute(params: { 
    id: string; 
    includeMetrics?: boolean; 
    userId?: string;
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