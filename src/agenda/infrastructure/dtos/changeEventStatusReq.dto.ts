import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { AgendaEventStatus } from '../../domain/enum/agendaEventStatus.enum';

export class ChangeEventStatusReqDto {
  @ApiProperty({
    description: 'The new status for the event',
    example: AgendaEventStatus.IN_PROGRESS,
    enum: AgendaEventStatus,
  })
  @IsEnum(AgendaEventStatus)
  status: AgendaEventStatus;

  @ApiProperty({
    description: 'Additional notes about the status change',
    example: 'Session started',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}