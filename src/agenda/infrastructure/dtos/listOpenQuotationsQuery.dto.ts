import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { OpenQuotationListItemDto } from '../../domain/dtos/openQuotationListItem.dto';

export class ListOpenQuotationsQueryDto {
  @ApiPropertyOptional({
    description: 'Maximum distance in KM from the artist to the customer location',
    example: 50,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(1000) // Sensible limit
  maxDistance?: number;

  // Add other potential filters like category, style etc.
  // Add pagination parameters (page, limit) if needed
}

export class GetOpenQuotationsResDto {
  @ApiProperty({ type: [OpenQuotationListItemDto] })
  quotations: OpenQuotationListItemDto[];

  // Add pagination metadata if needed
} 