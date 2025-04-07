import { Injectable } from '@nestjs/common';
import { StencilProvider } from '../../infrastructure/database/stencil.provider';
import { StencilDto } from '../../domain/dtos/stencil.dto';
import { BaseUseCase } from '../../../global/domain/usecases/base.usecase';
import { ContentMetricsEnricherService, WithMetrics, MetricsOptions } from '../../../analytics/infrastructure/services/content-metrics-enricher.service';
import { ContentType } from '../../../analytics/domain/enums/content-types.enum';

@Injectable()
export class GetStencilByIdUseCase extends BaseUseCase {
  constructor(
    private readonly stencilProvider: StencilProvider,
    private readonly metricsEnricher: ContentMetricsEnricherService,
  ) {
    super(GetStencilByIdUseCase.name);
  }

  async execute(params: { 
    id: number; 
    includeMetrics?: boolean; 
    userId?: number;
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