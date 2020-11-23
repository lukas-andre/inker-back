import { IsString, IsOptional, IsNumber } from 'class-validator';
import { JwtPermission } from '../interfaces/jwtPayload.interface';

export class LoginResponseDto {
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
