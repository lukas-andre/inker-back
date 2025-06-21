import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class ArtistAvailabilityQueryDto {
  @ApiProperty({
    description: 'Start date for availability search (defaults to today)',
    example: '2023-01-01',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  fromDate?: Date;

  @ApiProperty({
    description:
      'End date for availability search (defaults to 30 days from start)',
    example: '2023-01-31',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  toDate?: Date;

  @ApiProperty({
    description: 'Appointment duration in minutes (for slot calculation)',
    example: 120,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(15)
  @Type(() => Number)
  duration?: number;
}
