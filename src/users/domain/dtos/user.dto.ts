import { IsBoolean, IsEmail, IsEnum, IsString } from 'class-validator';
import { BaseDto } from '../../../global/domain/dtos/base.dto';
import { UserType } from '../enums/userType.enum';
import { RoleInterface } from '../models/role.model';
import { UserInterface } from '../models/user.model';

export class UserDto extends BaseDto implements UserInterface {
  role: RoleInterface;
  @IsString()
  username: string;
  @IsEmail()
  email: string;
  @IsEnum(UserType)
  userType: string;
  @IsBoolean()
  active: boolean;
}
