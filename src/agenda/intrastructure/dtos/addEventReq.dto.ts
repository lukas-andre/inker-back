import { IsString, IsIn, IsDate, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class AddEventReqDto {
  @ApiProperty({
    example: '1',
    description: 'User Email or User Username',
  })
  @IsString()
  readonly agendaId: string;

  @ApiProperty({
    example: new Date(),
    description: 'Start date',
  })
  @IsDate()
  readonly start: Date;

  @ApiProperty({
    example: new Date(),
    description: 'End date',
  })
  @IsDate()
  readonly end: Date;

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
