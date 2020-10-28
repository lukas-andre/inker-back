import { userTypes } from '../enums/userType.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsEnum } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'noname_eter',
    description: 'User Username',
  })
  @IsString()
  readonly username: string;

  @ApiProperty({
    example: 'lucas.henry@inker.cloud',
    description: 'User Email',
  })
  @IsEmail()
  readonly email: string;

  @ApiProperty({
    example: '1qaz2wsx',
    description: 'User Passowrd',
  })
  @IsString()
  readonly password: string;

  @ApiProperty({
    example: userTypes.ARTIST,
    enum: [Object.keys(userTypes)],
    description: 'User Type',
  })
  @IsEnum(userTypes)
  readonly userType: userTypes;

  @ApiProperty({
    example: '+56964484712',
    description: 'User phone numer',
  })
  @IsString()
  readonly phoneNumber?: string;
}
