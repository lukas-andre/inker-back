import { Injectable } from '@nestjs/common';
import { StencilRepository } from '../../infrastructure/repositories/stencil.repository';
import { StencilDto } from '../../domain/dtos/stencil.dto';
import { BaseUseCase } from '../../../global/domain/usecases/base.usecase';
import { ContentMetricsEnricherService, WithMetrics, MetricsOptions } from '../../../analytics/infrastructure/services/content-metrics-enricher.service';
import { ContentType } from '../../../analytics/domain/enums/content-types.enum';

@Injectable()
export class GetStencilByIdUseCase extends BaseUseCase {
  constructor(
    private readonly stencilProvider: StencilRepository,
    private readonly metricsEnricher: ContentMetricsEnricherService,
  ) {
    super(GetStencilByIdUseCase.name);
  }

  async execute(params: { 
    id: string; 
    includeMetrics?: boolean; 
    userId?: string;
    disableCache?: boolean;
  }): Promise<(StencilDto & WithMetrics) | null> {
    const { id, includeMetrics = true, userId, disableCache } = params;
    const stencil = await this.stencilProvider.findStencilById(id);
    
    if (!stencil) {
      return null;
    }
    
    const options: MetricsOptions = { disableCache };
    
    return includeMetrics 
      ? await this.metricsEnricher.enrichWithMetrics(stencil, ContentType.STENCIL, userId, options)
      : this.metricsEnricher.addEmptyMetrics(stencil);
  }
}