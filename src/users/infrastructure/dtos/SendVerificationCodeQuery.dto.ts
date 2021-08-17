import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsPhoneNumber, IsString } from 'class-validator';
import { VerificationType } from '../entities/verificationHash.entity';

export class SendVerificationCodeQueryDto {
  @IsString()
  // @IsPhoneNumber('CL') // * force users to enter numbers with the intl.
  readonly phoneNumber: string;

  @IsEnum(VerificationType)
  readonly type: VerificationType;
}
