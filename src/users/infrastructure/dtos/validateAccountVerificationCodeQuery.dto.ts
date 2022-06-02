import { IsEnum } from 'class-validator';
import { NotificationType } from '../entities/verificationHash.entity';

export class ValidateAccountVerificationCodeQueryDto {
  @IsEnum(NotificationType)
  readonly notificationType: NotificationType;
}
