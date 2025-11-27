import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';

import { AgendaEventTransition } from '../../domain/services/eventStateMachine.service';

export class ChangeEventStatusReqDto {
  @ApiProperty({
    description:
      'The action to perform on the event, triggering a state transition',
    example: AgendaEventTransition.START_SESSION,
    enum: AgendaEventTransition,
  })
  @IsEnum(AgendaEventTransition)
  eventAction: AgendaEventTransition;

  @ApiProperty({
    description:
      'The specific reason for the status change (e.g., reason for reschedule/cancellation)',
    example: 'Artist unavailable due to prior commitment.',
    required: false,
  })
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiProperty({
    description: 'Additional general notes or comments about the status change',
    example: 'Customer was understanding and agreed to the new terms.',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    description: 'New start date and time for the event, if rescheduling',
    example: '2023-01-01T09:00:00Z',
    required: false,
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  newStartDate?: Date;

  @ApiProperty({
    description: 'New end date and time for the event, if rescheduling',
    example: '2023-01-01T11:00:00Z',
    required: false,
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  newEndDate?: Date;
}
