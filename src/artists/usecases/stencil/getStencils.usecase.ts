import { Injectable } from '@nestjs/common';
import { StencilRepository } from '../../infrastructure/repositories/stencil.repository';
import { BaseUseCase } from '../../../global/domain/usecases/base.usecase';
import { StencilQueryDto } from '../../domain/dtos/stencil-query.dto';
import { PaginatedStencilResponseDto } from '../../domain/dtos/paginated-stencil-response.dto';
import { ContentMetricsEnricherService, WithMetrics, MetricsOptions } from '../../../analytics/infrastructure/services/content-metrics-enricher.service';
import { ContentType } from '../../../analytics/domain/enums/content-types.enum';
import { StencilDto } from '../../domain/dtos/stencil.dto';

// Extend the paginated response to use the WithMetrics type
export interface PaginatedResponseWithMetrics<T> extends Omit<PaginatedStencilResponseDto, 'items'> {
  items: (T & WithMetrics)[];
}

@Injectable()
export class GetStencilsUseCase extends BaseUseCase {
  constructor(
    private readonly stencilProvider: StencilRepository,
    private readonly metricsEnricher: ContentMetricsEnricherService,
  ) {
    super(GetStencilsUseCase.name);
  }

  async execute(params: { 
    artistId: string; 
    query: StencilQueryDto & { includeMetrics?: boolean };
    userId?: string;
    disableCache?: boolean;
  }): Promise<PaginatedResponseWithMetrics<StencilDto>> {
    const { artistId, query, userId, disableCache } = params;
    const { page = 1, limit = 10, status, includeHidden = false, includeMetrics = true } = query;
    
    const [stencils, total] = await this.stencilProvider.findStencilsByArtistIdWithPagination(
      artistId,
      page,
      limit,
      status,
      includeHidden,
    );
    
    const pages = Math.ceil(total / limit);
    
    const paginatedResponse = {
      items: stencils,
      page,
      limit,
      total,
      pages,
    };
    
    const options: MetricsOptions = { disableCache };
    
    return includeMetrics
      ? await this.metricsEnricher.enrichPaginatedWithMetrics(paginatedResponse, ContentType.STENCIL, userId, options)
      : {
          ...paginatedResponse,
          items: this.metricsEnricher.addEmptyMetricsToAll(stencils),
        };
  }
}