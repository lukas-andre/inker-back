import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';

import { AddressDto } from '../../../global/infrastructure/dtos/address.dto';

export class CreateArtistDto {
  @ApiProperty({
    example: '12345',
    description: 'User Id',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    example: 'noname_eter',
    description: 'Username',
  })
  @IsString()
  username: string;

  @ApiProperty({
    example: 'Lucas',
    description: 'First Name',
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    example: 'Henry',
    description: 'Last Name',
  })
  @IsString()
  lastName: string;

  @ApiProperty({
    example: 'test@inker.cl',
    description: 'Customer contact email',
  })
  @IsString()
  contactEmail?: string;

  @ApiProperty({
    example: '+56964484712',
    description: 'Customer phone numer',
  })
  @IsString()
  phoneNumber?: string;

  @ApiProperty({
    description: 'User phone numer',
    required: false,
    type: AddressDto,
  })
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

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
  @Transform(value => Boolean(value.value === 'true' || value.value === true))
  agendaIsPublic: boolean;

  @ApiProperty({
    example: true,
    description: 'True if artist set agenda open',
  })
  @IsBoolean()
  @Transform(value => Boolean(value.value === 'true' || value.value === true))
  agendaIsOpen: boolean;
}
