import { applyDecorators } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiNotAcceptableResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { DefaultResponseDto } from '../../../../global/infrastructure/dtos/defaultResponse.dto';
import { NotificationType } from '../../entities/verificationHash.entity';

export function ValidateAccountVerificationCodeDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Validate Account Verification Code' }),
    ApiParam({
      name: 'userId',
      description: 'User id',
      required: true,
      example: 1,
      type: Number,
    }),
    ApiParam({
      name: 'code',
      description: 'Verification code',
      required: true,
      example: 1000,
      type: Number,
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
      description: 'Account validate',
      type: DefaultResponseDto,
    }),
    ApiNotFoundResponse({ description: 'Hash for user not found' }),
    ApiNotAcceptableResponse({ description: 'User does not exists' }),
    ApiUnprocessableEntityResponse({ description: 'Could not activate user' }),
    ApiConflictResponse({ description: 'Invalid code' }),
  );
}
