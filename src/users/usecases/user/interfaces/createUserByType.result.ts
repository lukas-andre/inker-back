import { UserType } from '../../../domain/enums/userType.enum';
import { IsString, IsEmail, IsEnum, IsOptional } from 'class-validator';

export class CreateUserByTypeResult {
  @IsString()
  @IsOptional()
  readonly username: string;

  @IsString()
  @IsOptional()
  readonly firstName: string;

  @IsString()
  @IsOptional()
  readonly lastName: string;

  @IsEmail()
  @IsOptional()
  readonly email: string;

  @IsEnum(UserType)
  readonly userType: UserType;

  @IsString()
  @IsOptional()
  readonly phoneNumber?: string;
}
