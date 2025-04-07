import { ApiProperty } from '@nestjs/swagger';
import { WorkDto } from './work.dto';

export class WorkWithRelevanceDto extends WorkDto {
  @ApiProperty({ description: 'Relevance score for search results', example: 0.85 })
  relevanceScore?: number;

  @ApiProperty({ description: 'Factors that contributed to the relevance score', example: ['title_match', 'recent'] })
  relevanceFactors?: string[];
}

export class PaginatedWorkResponseDto {
  @ApiProperty({ type: [WorkWithRelevanceDto] })
  items: WorkWithRelevanceDto[];

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 50 })
  total: number;

  @ApiProperty({ example: 5 })
  pages: number;
}

