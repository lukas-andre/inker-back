import { ApiProperty } from '@nestjs/swagger';
import { WorkDto } from './work.dto';

export class PaginationMeta {
  @ApiProperty({ description: 'Total number of items' })
  total: number;

  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Number of items per page' })
  limit: number;

  @ApiProperty({ description: 'Total number of pages' })
  totalPages: number;
}

export class PaginatedWorkResponseDto {
  @ApiProperty({
    description: 'Array of works',
    type: [WorkDto],
  })
  data: WorkDto[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMeta,
  })
  meta: PaginationMeta;
} 