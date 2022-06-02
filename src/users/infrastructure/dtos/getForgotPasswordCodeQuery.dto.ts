import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  ValidateIf,
} from 'class-validator';
import { NotificationType } from '../entities/verificationHash.entity';

export class GetForgotPasswordCodeQueryDto {
  @ValidateIf(v => v.notificationType === NotificationType.SMS)
  @IsString()
  @IsNotEmpty()
  readonly phoneNumber: string;

  @ValidateIf(v => v.notificationType === NotificationType.EMAIL)
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsEnum(NotificationType)
  readonly notificationType: NotificationType;
}
