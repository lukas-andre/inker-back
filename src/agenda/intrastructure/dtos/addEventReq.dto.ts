import { IsString, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOnlyDate } from '../../../global/domain/validators/isOnlyDate.validator';
import { IsStartDate } from '../../../global/domain/validators/isStartDate.validator';
import { IsEndDate } from '../../../global/domain/validators/isEndDate.validator';

export class AddEventReqDto {
  @ApiProperty({
    example: 1,
    description: 'User Email or User Username',
  })
  @IsString()
  readonly agendaId: number;

  @ApiProperty({
    example: '2021-05-18 16:00:00',
    description: 'Start date string(format:YYYY-MM-DD hh:mm:ss)',
  })
  @IsOnlyDate()
  @IsStartDate({
    message: 'Start date must be less than end date',
  })
  readonly start: string;

  @ApiProperty({
    example: '2021-05-18 16:30:00',
    description: 'End date string(format:YYYY-MM-DD hh:mm:ss)',
  })
  @IsOnlyDate()
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
  @Transform(value => Boolean(value === 'true' || value === true))
  @IsBoolean()
  readonly notification: boolean;
}
