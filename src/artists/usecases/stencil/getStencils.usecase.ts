import { Injectable } from '@nestjs/common';
import { StencilProvider } from '../../infrastructure/database/stencil.provider';
import { BaseUseCase } from '../../../global/domain/usecases/base.usecase';
import { StencilQueryDto } from '../../domain/dtos/stencil-query.dto';
import { PaginatedStencilResponseDto } from '../../domain/dtos/paginated-stencil-response.dto';
import { GetContentSummaryMetricsUseCase } from '../../../analytics/usecases/getContentSummaryMetrics.usecase';
import { ContentType } from '../../../analytics/domain/enums/content-types.enum';
import { StencilDto } from '../../domain/dtos/stencil.dto';

// Extended DTO that includes metrics
export interface StencilDtoWithMetrics extends StencilDto {
  metrics: {
    viewCount: number;
    likeCount: number;
  };
}

// Extend the paginated response to use the new DTO
export interface PaginatedStencilWithMetricsResponseDto extends Omit<PaginatedStencilResponseDto, 'items'> {
  items: StencilDtoWithMetrics[];
}

@Injectable()
export class GetStencilsUseCase extends BaseUseCase {
  constructor(
    private readonly stencilProvider: StencilProvider,
    private readonly getContentSummaryMetricsUseCase: GetContentSummaryMetricsUseCase,
  ) {
    super(GetStencilsUseCase.name);
  }

  async execute(params: { 
    artistId: number; 
    query: StencilQueryDto & { includeMetrics?: boolean };
  }): Promise<PaginatedStencilWithMetricsResponseDto> {
    const { artistId, query } = params;
    const { page = 1, limit = 10, status, includeHidden = false, includeMetrics = true } = query;
    
    const [stencils, total] = await this.stencilProvider.findStencilsByArtistIdWithPagination(
      artistId,
      page,
      limit,
      status,
      includeHidden,
    );
    
    const pages = Math.ceil(total / limit);
    
    // If no stencils or metrics not requested, return early
    if (!stencils.length || !includeMetrics) {
      const stencilsWithEmptyMetrics = stencils.map(stencil => ({
        ...stencil,
        metrics: {
          viewCount: 0,
          likeCount: 0
        }
      }));
      
      return {
        items: stencilsWithEmptyMetrics,
        page,
        limit,
        total,
        pages,
      };
    }
    
    // Get all stencil IDs for batch lookup
    const stencilIds = stencils.map(stencil => stencil.id);
    
    // Fetch metrics for all stencils in a single batch query
    const metricsMap = await this.getContentSummaryMetricsUseCase.executeBatch(
      stencilIds, 
      ContentType.STENCIL
    );
    
    // Map the stencils with their metrics
    const stencilsWithMetrics = stencils.map(stencil => ({
      ...stencil,
      metrics: metricsMap.get(stencil.id) || {
        viewCount: 0,
        likeCount: 0
      }
    }));
    
    return {
      items: stencilsWithMetrics,
      page,
      limit,
      total,
      pages,
    };
  }
}