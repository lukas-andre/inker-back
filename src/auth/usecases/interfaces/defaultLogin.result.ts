import { IsNumber, IsOptional, IsString } from 'class-validator';
import { JwtPermission } from '../../../global/domain/interfaces/jwtPayload.interface';

export class DefaultLoginResult {
  @IsNumber()
  id: number;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsNumber()
  @IsOptional()
  userTypeId?: number;

  @IsString()
  userType: string;

  permission: JwtPermission[];

  @IsString()
  accessToken: string;

  @IsNumber()
  expiresIn: number;
}
