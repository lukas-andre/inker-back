import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class CreateArtistDto {
  @ApiProperty({
    example: '12345',
    description: 'User Id',
  })
  @IsNumber()
  readonly userId: number;

  @ApiProperty({
    example: 'noname_eter',
    description: 'Username',
  })
  @IsString()
  readonly username: string;

  @ApiProperty({
    example: 'Lucas',
    description: 'First Name',
  })
  @IsString()
  readonly firstName: string;

  @ApiProperty({
    example: 'Henry',
    description: 'Last Name',
  })
  @IsString()
  readonly lastName: string;

  @ApiProperty({
    example: 'test@inker.cl',
    description: 'Customer contact email',
  })
  @IsString()
  readonly contactEmail?: string;

  @ApiProperty({
    example: '+56964484712',
    description: 'Customer phone numer',
  })
  @IsString()
  readonly phoneNumber?: string;

  @ApiProperty({
    example: ['2', '3', '4', '5', '6'],
    description: 'Week working days',
  })
  @IsString({ each: true })
  agendaWorkingDays: string[];

  @ApiProperty({
    example: true,
    description: 'True if artist set agenda public',
  })
  @Transform(value => Boolean(value === 'true' || value === true))
  agendaIsPublic: boolean;

  @ApiProperty({
    example: true,
    description: 'True if artist set agenda open',
  })
  @IsBoolean()
  @Transform(value => Boolean(value === 'true' || value === true))
  agendaIsOpen: boolean;
}
