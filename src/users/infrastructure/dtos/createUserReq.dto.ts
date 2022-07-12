import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsInstance,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { UserType } from '../../domain/enums/userType.enum';
import { ArtistInfoDto } from './artistInfo.dto';
import {
  PhoneNumberDetailsDto,
  PhoneNumberDetailsInterface,
} from './phoneNumberDetails.dto';

export class CreateUserReqDto {
  @ApiProperty({
    example: 'noname_eter',
    description: 'User Username',
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly username: string;

  @ApiProperty({
    example: 'lucas.henry@inker.cloud',
    description: 'User Email',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  readonly email: string;

  @ApiProperty({
    example: '1qaz2wsx',
    description: 'User Password',
  })
  @IsString()
  readonly password: string;

  @ApiProperty({
    description: 'User Phone Number',
    required: true,
    example: {
      countryCode: 'CL',
      number: '+56964484712',
      dialCode: '+56',
    } as PhoneNumberDetailsInterface,
  })
  @Type(() => PhoneNumberDetailsDto)
  @ValidateNested()
  readonly phoneNumberDetails: PhoneNumberDetailsDto;

  @ApiProperty({
    example: 'Lucas',
    description: 'First Name',
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly firstName: string;

  @ApiProperty({
    example: 'Henry',
    description: 'Last Name',
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly lastName: string;

  @ApiProperty({
    example: UserType.ARTIST,
    enum: [UserType.ARTIST, UserType.CUSTOMER],
    description: 'User Type',
  })
  @IsEnum(UserType)
  readonly userType: UserType;

  @ApiProperty({
    description: 'Artist',
    required: false,
    type: ArtistInfoDto,
  })
  @ValidateIf(v => v.userType === UserType.ARTIST)
  @ValidateNested()
  @IsInstance(ArtistInfoDto)
  @Type(() => ArtistInfoDto)
  readonly artistInfo: ArtistInfoDto;
}
