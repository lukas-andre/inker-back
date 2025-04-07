import { ApiProperty } from '@nestjs/swagger';
import { StencilDto } from './stencil.dto';

export class StencilWithRelevanceDto extends StencilDto {
  @ApiProperty({ description: 'Relevance score for search results', example: 0.85 })
  relevanceScore?: number;

  @ApiProperty({ description: 'Factors that contributed to the relevance score', example: ['title_match', 'recent'] })
  relevanceFactors?: string[];
}

export class PaginatedStencilResponseDto {
  @ApiProperty({ type: [StencilWithRelevanceDto] })
  items: StencilWithRelevanceDto[];

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 50 })
  total: number;

  @ApiProperty({ example: 5 })
  pages: number;
} 