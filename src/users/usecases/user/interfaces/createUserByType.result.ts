import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';

import { UserType } from '../../../domain/enums/userType.enum';

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
