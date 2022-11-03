import { IsEnum, IsString } from 'class-validator';

import { NotificationType } from '../entities/verificationHash.entity';

export class SendAccountVerificationCodeQueryDto {
  @IsString()
  // @IsPhoneNumber('CL') // * force users to enter numbers with the intl.
  readonly phoneNumber: string;

  @IsEnum(NotificationType)
  readonly notificationType: NotificationType;
}
