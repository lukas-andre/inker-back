import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsOptional,
  IsPhoneNumber,
  IsEnum,
} from 'class-validator';
import { NotificationType } from '../entities/verificationHash.entity';

export class SendForgotPasswordCodeReqDto {
  @ApiProperty({
    description: 'User email',
    example: 'user@example.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'User phone number',
    example: '+34666666666',
    required: false,
  })
  @IsPhoneNumber()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({
    description: 'Notification type',
    example: 'EMAIL',
    enum: ['EMAIL', 'SMS'],
    required: true,
  })
  @IsString()
  @IsEnum(NotificationType)
  notificationType: NotificationType;
}
