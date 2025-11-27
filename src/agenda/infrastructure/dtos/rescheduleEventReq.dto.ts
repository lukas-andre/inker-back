import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class RescheduleEventReqDto {
  @ApiProperty({
    description: 'New start date and time for the event',
    example: '2023-01-01T09:00:00Z',
  })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  newStartDate: Date;

  @ApiProperty({
    description: 'New end date and time for the event',
    example: '2023-01-01T11:00:00Z',
  })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  newEndDate: Date;

  @ApiProperty({
    description: 'Reason for rescheduling',
    example: 'Artist unavailable due to personal emergency',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  reason: string;
}
