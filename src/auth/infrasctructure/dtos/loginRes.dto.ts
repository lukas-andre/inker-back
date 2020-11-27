import { IsString, IsOptional, IsNumber } from 'class-validator';
import { JwtPermission } from '../../domain/interfaces/jwtPayload.interface';

export class LoginResDto {
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

  permision: JwtPermission[];

  @IsString()
  accessToken: string;

  @IsNumber()
  expiresIn: number;
}
