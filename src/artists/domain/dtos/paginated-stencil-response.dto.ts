import { ApiProperty } from '@nestjs/swagger';
import { StencilDto } from './stencil.dto';

export class PaginatedStencilResponseDto {
  @ApiProperty({ type: [StencilDto] })
  items: StencilDto[];

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 50 })
  total: number;

  @ApiProperty({ example: 5 })
  pages: number;
} 