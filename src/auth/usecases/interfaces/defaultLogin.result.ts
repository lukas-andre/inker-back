import { IsOptional, IsString } from 'class-validator';

import { JwtPermission } from '../../../global/domain/interfaces/jwtPayload.interface';

export class DefaultLoginResult {
  @IsString()
  id: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  userTypeId?: string;

  @IsString()
  userType: string;

  permission: JwtPermission[];

  @IsString()
  accessToken: string;

  @IsString()
  expiresIn: string;
}
