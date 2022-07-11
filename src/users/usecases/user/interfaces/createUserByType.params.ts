import { IsEmail, IsOptional, IsString } from 'class-validator';
import { UserType } from '../../../domain/enums/userType.enum';
import { ArtistInfoInterface } from '../../../infrastructure/dtos/artistInfo.dto';
import { PhoneNumberDetailsInterface } from '../../../infrastructure/dtos/phoneNumberDetails.dto';

export class CreateUserByTypeParams {
  @IsString()
  @IsOptional()
  username: string;

  @IsEmail()
  @IsOptional()
  email: string;

  @IsString()
  password: string;

  phoneNumberDetails: PhoneNumberDetailsInterface;

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
