import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

import { DefaultResponseDto } from '../../../../global/infrastructure/dtos/defaultResponse.dto';
import { NotificationType } from '../../entities/verificationHash.entity';

export function GetForgotPasswordCode() {
  return applyDecorators(
    ApiOperation({ summary: 'Get Forgot Password Code For Reset Password' }),
    ApiParam({
      name: 'userId',
      description: 'User id',
      required: true,
      example: '1',
      type: String,
    }),
    ApiQuery({
      name: 'phoneNumber',
      description: 'Phone number intl',
      example: '+56964484712',
      required: false,
    }),
    ApiQuery({
      name: 'email',
      description: 'User email',
      example: 'lucas.henry@gmail.com',
      required: false,
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
      description: 'Code has been sended',
      type: DefaultResponseDto,
    }),
    ApiBadRequestResponse({ description: 'User does not exists' }),
    ApiConflictResponse({ description: 'SMS or Email already sended' }),
  );
}
