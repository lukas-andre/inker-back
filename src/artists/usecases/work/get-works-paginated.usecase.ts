import { Injectable } from '@nestjs/common';
import { WorkProvider } from '../../infrastructure/database/work.provider';
import { WorkDto } from '../../domain/dtos/work.dto';
import { BaseUseCase } from '../../../global/domain/usecases/base.usecase';
import { WorkQueryDto } from '../../domain/dtos/work-query.dto';
import { PaginatedWorkResponseDto } from '../../domain/dtos/paginated-work-response.dto';

@Injectable()
export class GetWorksPaginatedUseCase extends BaseUseCase {
  constructor(private readonly workProvider: WorkProvider) {
    super(GetWorksPaginatedUseCase.name);
  }

  async execute(params: { 
    artistId: number; 
    query: WorkQueryDto 
  }): Promise<PaginatedWorkResponseDto> {
    const { artistId, query } = params;
    const { page = 1, limit = 10, isFeatured, source, includeHidden = false } = query;
    
    const [works, total] = await this.workProvider.findWorksByArtistIdWithPagination(
      artistId,
      page,
      limit,
      isFeatured,
      source,
      includeHidden
    );
    
    return {
      data: works,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    };
  }
} 