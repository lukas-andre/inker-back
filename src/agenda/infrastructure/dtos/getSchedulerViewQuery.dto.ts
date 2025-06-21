import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

export class GetSchedulerViewQueryDto {
  @ApiProperty({
    description: 'Start date for the scheduler view',
    example: '2024-01-15T00:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  fromDate: string;

  @ApiProperty({
    description: 'End date for the scheduler view',
    example: '2024-01-22T00:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  toDate: string;

  @ApiProperty({
    description: 'Include availability calendar in response',
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  includeAvailability?: boolean = true;

  @ApiProperty({
    description: 'Include suggested time slots in response',
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  includeSuggestions?: boolean = false;

  @ApiProperty({
    description: 'Default duration in minutes for availability calculations',
    required: false,
    default: 60,
    minimum: 15,
    maximum: 480,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(15)
  @Max(480)
  defaultDuration?: number = 60;
}
