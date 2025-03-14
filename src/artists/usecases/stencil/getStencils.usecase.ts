import { Injectable } from '@nestjs/common';
import { StencilProvider } from '../../infrastructure/database/stencil.provider';
import { StencilDto } from '../../domain/dtos/stencil.dto';
import { BaseUseCase } from '../../../global/domain/usecases/base.usecase';
import { StencilQueryDto } from '../../domain/dtos/stencil-query.dto';
import { PaginatedStencilResponseDto } from '../../domain/dtos/paginated-stencil-response.dto';

@Injectable()
export class GetStencilsUseCase extends BaseUseCase {
  constructor(private readonly stencilProvider: StencilProvider) {
    super(GetStencilsUseCase.name);
  }

  async execute(params: { artistId: number; query: StencilQueryDto }): Promise<PaginatedStencilResponseDto> {
    const { artistId, query } = params;
    const { page = 1, limit = 10, includeHidden } = query;
    
    const [stencils, total] = await this.stencilProvider.findStencilsByArtistIdWithPagination(
      artistId,
      page,
      limit,
      includeHidden
    );
    
    // Calculate total pages
    const pages = Math.ceil(total / limit);
    
    return {
      items: stencils,
      page,
      limit,
      total,
      pages,
    };
  }
}