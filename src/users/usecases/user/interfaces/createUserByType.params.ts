import { UserType } from '../../../domain/enums/userType.enum';
import { IsString, IsEmail, IsEnum, IsOptional } from 'class-validator';

export class CreateUserByTypeParams {
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

  @IsString()
  readonly password: string;

  @IsEnum(UserType)
  readonly userType: UserType;

  @IsString()
  @IsOptional()
  readonly phoneNumber?: string;
}
