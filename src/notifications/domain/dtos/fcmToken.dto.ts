import { DeviceType } from '../../database/entities/userFcmToken.entity';

export interface RegisterFcmTokenDto {
  userId: string;
  token: string;
  deviceType: DeviceType;
}

export interface RemoveFcmTokenDto {
  userId: string;
  token: string;
}