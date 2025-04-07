import { Injectable } from '@nestjs/common';
import { WorkProvider } from '../../infrastructure/database/work.provider';
import { WorkDto } from '../../domain/dtos/work.dto';
import { BaseUseCase } from '../../../global/domain/usecases/base.usecase';
import { WorkQueryDto } from '../../domain/dtos/work-query.dto';
import { PaginatedWorkResponseDto } from '../../domain/dtos/paginated-work-response.dto';
import { ContentMetricsEnricherService, WithMetrics, MetricsOptions } from '../../../analytics/infrastructure/services/content-metrics-enricher.service';
import { ContentType } from '../../../analytics/domain/enums/content-types.enum';

// Define a type for the paginated response with metrics
export interface PaginatedWorkResponseWithMetrics extends Omit<PaginatedWorkResponseDto, 'items'> {
  items: (WorkDto & WithMetrics)[];
}

@Injectable()
export class GetWorksPaginatedUseCase extends BaseUseCase {
  constructor(
    private readonly workProvider: WorkProvider,
    private readonly metricsEnricher: ContentMetricsEnricherService,
  ) {
    super(GetWorksPaginatedUseCase.name);
  }

  async execute(params: { 
    artistId: number; 
    query: WorkQueryDto;
    userId?: number;
    disableCache?: boolean;
  }): Promise<PaginatedWorkResponseWithMetrics> {
    const { artistId, query, userId, disableCache } = params;
    const { page = 1, limit = 10, isFeatured, source, includeHidden = false, includeMetrics = true } = query;
    
    const [works, total] = await this.workProvider.findWorksByArtistIdWithPagination(
      artistId,
      page,
      limit,
      isFeatured,
      source,
      includeHidden,    
    );
    
    const pages = Math.ceil(total / limit);
    
    const paginatedResponse = {
      items: works,
      page,
      limit,
      total,
      pages
    };

    const options: MetricsOptions = { disableCache };
    
    // Enrich with metrics if requested
    return includeMetrics
      ? await this.metricsEnricher.enrichPaginatedWithMetrics(paginatedResponse, ContentType.WORK, userId, options)
      : {
          ...paginatedResponse,
          items: this.metricsEnricher.addEmptyMetricsToAll(works)
        };
  }
} 