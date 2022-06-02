import { applyDecorators } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { DefaultResponseDto } from '../../../../global/infrastructure/dtos/defaultResponse.dto';
import { NotificationType } from '../../entities/verificationHash.entity';

export function SendAccountVerificationCodeDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Send SMS Account Verification Code' }),
    ApiParam({
      name: 'userId',
      description: 'User id',
      required: true,
      example: 1,
      type: Number,
    }),
    ApiQuery({
      name: 'phoneNumber',
      description: 'Phone number intl',
      example: '+56964484712',
      required: true,
    }),
    ApiQuery({
      name: 'notificationType',
      description: 'Notification type',
      enum: NotificationType,
      enumName: 'NotificationType',
      example: NotificationType.SMS,
      required: true,
    }),
    ApiOkResponse({
      description: 'SMS has been sended',
      type: DefaultResponseDto,
    }),
    ApiNotFoundResponse({ description: 'User does not exists' }),
    ApiConflictResponse({ description: 'SMS already sended' }),
  );
}
