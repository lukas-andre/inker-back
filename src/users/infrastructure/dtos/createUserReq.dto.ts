import { UserType } from '../../domain/enums/userType.enum';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ArtistInfoInterface, ArtistInfoDto } from './artistInfo.dto';

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
    example: '+56964484712',
    description: 'User phone number',
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly phoneNumber?: string;

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
  @ValidateIf((v) => v.userType === UserType.ARTIST)
  @ValidateNested()
  @Type(() => ArtistInfoDto)
  readonly artistInfo: ArtistInfoInterface;
}
