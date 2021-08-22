import { IsEnum } from 'class-validator';
import { VerificationType } from '../entities/verificationHash.entity';

export class ValidateVerificationCodeQueryDto {
  @IsEnum(VerificationType)
  readonly type: VerificationType;
}
