import { IsString } from 'class-validator';
import { DeviceType } from '../../../notifications/database/entities/userFcmToken.entity';

export class LoginParams {
  @IsString()
  readonly identifier: string;

  @IsString()
  readonly password: string;

  @IsString() readonly loginType: string;

  @IsString() readonly fcmToken?: string;

  @IsString() readonly deviceType?: DeviceType;
}
