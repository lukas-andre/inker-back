import { IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LoginType } from '../enums/loginType.enum';

export class LoginDto {
  @ApiProperty({
    example: 'lucas.henrydz@gmail.com | noname_eter',
    description: 'User Email or User Username',
  })
  @IsString()
  readonly identifier: string;

  @ApiProperty({
    example: '1qaz2wsx',
    description: 'User Password',
  })
  @IsString()
  readonly password: string;

  @ApiProperty({
    example: LoginType.EMAIL,
    description: 'login type',
    enum: LoginType,
  })
  @IsString()
  @IsIn(Object.keys(LoginType))
  readonly loginType: string;
}
