import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEmail, IsString } from 'class-validator';

import { BaseDto } from '../../../global/domain/dtos/base.dto';
import { ContactInterface } from '../interfaces/contact.interface';

export class ContactDto extends BaseDto implements ContactInterface {
  @ApiProperty({
    description: 'Email address of the artist',
    required: true,
    type: String,
    example: 'noname',
  })
  @IsEmail()
  @Expose()
  email: string;

  @ApiProperty({
    description: 'Phone number of the artist',
    required: true,
    type: String,
    example: '+1-555-555-5555',
  })
  @IsString()
  @Expose()
  phone: string;

  @ApiProperty({
    description: 'Phone dial code of the artist',
    required: true,
    type: String,
    example: '+1',
  })
  @IsString()
  @Expose()
  phoneDialCode: string;

  @ApiProperty({
    description: 'Phone country ISO code of the artist',
    required: true,
    type: String,
    example: 'US',
  })
  @IsString()
  @Expose()
  phoneCountryIsoCode: string;
}
