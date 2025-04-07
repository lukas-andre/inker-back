import { IsEnum, IsString } from 'class-validator';
import { DeviceType } from '../../../notifications/database/entities/userFcmToken.entity';
import { LoginType } from '../../domain/enums/loginType.enum';

export class LoginParams {
  @IsString()
  readonly identifier: string;

  @IsString()
  readonly password: string;

  @IsEnum(LoginType) readonly loginType: LoginType;

  @IsString() readonly fcmToken?: string;

  @IsString() readonly deviceType?: DeviceType;
}
