import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNumber, IsString, IsUUID } from 'class-validator';

import { IsEndDate } from '../../../global/domain/validators/isEndDate.validator';
import { ValidateDateFormat } from '../../../global/domain/validators/isOnlyDate.validator';
import { IsStartDate } from '../../../global/domain/validators/isStartDate.validator';

export class AddEventReqDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Agenda Id',
  })
  @IsUUID()
  readonly agendaId: string;

  @ApiProperty({
    example: '2021-05-18 16:00:00',
    description: 'Start date string(format:YYYY-MM-DD hh:mm:ss)',
  })
  @ValidateDateFormat('YYYY-MM-DD hh:dd:ss')
  @IsStartDate({
    message: 'Start date must be less than end date',
  })
  readonly start: string;

  @ApiProperty({
    example: '2021-05-18 16:30:00',
    description: 'End date string(format:YYYY-MM-DD hh:mm:ss)',
  })
  @ValidateDateFormat('YYYY-MM-DD hh:dd:ss')
  @IsEndDate({
    message: 'End date must be greater than end date',
  })
  readonly end: string;

  @ApiProperty({
    example: 'Tatto for Lucas',
    description: 'Event title',
  })
  @IsString()
  readonly title: string;

  @ApiProperty({
    example: 'This tatto bla bla bla bla ba',
    description: 'Extra info',
  })
  @IsString()
  readonly info: string;

  @ApiProperty({
    example: 'Red',
    description: 'Event color',
  })
  @IsString()
  readonly color: string;

  @ApiProperty({
    example: true,
    description: 'True for active notifiactions for this event',
  })
  @Transform(value => Boolean(value.value === 'true' || value.value === true))
  @IsBoolean()
  readonly notification: boolean;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Customer Id',
  })
  @IsUUID()
  readonly customerId: string;
}
