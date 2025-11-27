import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';

import { OpenQuotationListItemDto } from '../../domain/dtos/openQuotationListItem.dto';

export class ListOpenQuotationsQueryDto {
  @ApiPropertyOptional({
    description:
      'Maximum distance in kilometers that the artist is willing to travel',
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxDistance?: number;

  // Add other potential filters like category, style etc.
  // Add pagination parameters (page, limit) if needed
}

export class GetOpenQuotationsResDto {
  @ApiProperty({ type: [OpenQuotationListItemDto] })
  items: OpenQuotationListItemDto[];

  @ApiProperty({ description: 'Total number of items', example: 10 })
  total: number;

  // Add pagination metadata if needed
}
