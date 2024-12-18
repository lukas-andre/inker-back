import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';

import { NotificationType } from '../entities/verificationHash.entity';
import { IsNull } from 'typeorm';

export class SendAccountVerificationCodeQueryDto {
  @IsString()
  @IsOptional()
  // @IsPhoneNumber('CL') // * force users to enter numbers with the intl.
  readonly phoneNumber: string;

  @IsString()
  @IsOptional()  
  readonly email: string;

  @IsEnum(NotificationType)
  readonly notificationType: NotificationType;
}
