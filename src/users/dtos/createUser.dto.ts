import { UserType } from '../enums/userType.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsEnum, IsOptional } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'noname_eter',
    description: 'User Username',
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly username: string;

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
    example: 'lucas.henry@inker.cloud',
    description: 'User Email',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  readonly email: string;

  @ApiProperty({
    example: '1qaz2wsx',
    description: 'User Passowrd',
  })
  @IsString()
  readonly password: string;

  @ApiProperty({
    example: UserType.ARTIST,
    enum: [UserType.ARTIST, UserType.CUSTOMER],
    description: 'User Type',
  })
  @IsEnum(UserType)
  readonly userType: UserType;

  @ApiProperty({
    example: '+56964484712',
    description: 'User phone numer',
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly phoneNumber?: string;
}
