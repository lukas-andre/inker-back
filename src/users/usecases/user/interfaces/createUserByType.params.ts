import { UserType } from '../../../domain/enums/userType.enum';
import { IsString, IsEmail, IsEnum, IsOptional } from 'class-validator';
import { ArtistInfoInterface } from '../../../infrastructure/dtos/artistInfo.dto';

export class CreateUserByTypeParams {
  @IsString()
  @IsOptional()
  username: string;

  @IsEmail()
  @IsOptional()
  email: string;

  @IsString()
  password: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  firstName: string;

  @IsString()
  @IsOptional()
  lastName: string;

  @IsString()
  userType: UserType;

  @IsOptional()
  artistInfo?: ArtistInfoInterface;
}
