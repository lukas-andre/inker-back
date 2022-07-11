import { ApiProperty } from '@nestjs/swagger';
import { IsPhoneNumber, IsString } from 'class-validator';

export interface PhoneNumberDetailsInterface {
  countryCode: string;
  number: string;
  dialCode: string;
}

export class PhoneNumberDetailsDto implements PhoneNumberDetailsInterface {
  @ApiProperty({
    example: 'CL',
    description: 'Country ISO Code',
    required: true,
  })
  @IsString()
  readonly countryCode: string;

  @ApiProperty({
    example: '+56964484712',
    description: 'Phone Number',
    required: true,
  })
  @IsString()
  @IsPhoneNumber()
  readonly number: string;

  @ApiProperty({
    example: '+56',
    description: 'Dial Code',
    required: true,
  })
  @IsString()
  readonly dialCode: string;
}
