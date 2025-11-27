import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

import { DeviceType } from '../../../notifications/database/entities/userFcmToken.entity';
import { LoginType } from '../../domain/enums/loginType.enum';

export class LoginReqDto {
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
  @IsIn(Object.values(LoginType))
  readonly loginType: LoginType;

  @ApiProperty({
    example: 'web',
    description: 'Device type (android, ios, web)',
    enum: DeviceType,
    required: false,
  })
  @IsString()
  @IsIn(Object.values(DeviceType))
  @IsOptional()
  readonly deviceType?: DeviceType;

  @ApiProperty({
    example: 'eKj2...Mks9',
    description: 'FCM device token for push notifications',
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly fcmToken?: string;
}
