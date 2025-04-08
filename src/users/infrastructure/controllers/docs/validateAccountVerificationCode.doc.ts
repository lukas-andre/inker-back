import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
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
import { errorCodesToOASDescription } from '../../../../global/infrastructure/helpers/errorCodesToOASDescription.helper';
import {
  ERROR_ACTIVATING_USER,
  HASH_NOT_FOUND_FOR_USER_ID,
  INVALID_VERIFICATION_CODE,
  USER_ALREADY_VERIFIED,
  USER_ID_IS_NOT_VALID,
  USER_NOT_ACCEPTED,
} from '../../../domain/errors/codes';
import { NotificationType } from '../../entities/verificationHash.entity';

export function ValidateAccountVerificationCodeDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Validate Account Verification Code' }),
    ApiParam({
      name: 'userId',
      description: 'User id',
      required: true,
      example: '1',
      type: String,
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
    ApiNotAcceptableResponse({
      description: USER_NOT_ACCEPTED,
    }),
    ApiBadRequestResponse({
      description: errorCodesToOASDescription([
        USER_ID_IS_NOT_VALID,
        USER_ALREADY_VERIFIED,
      ]),
    }),
    ApiNotFoundResponse({
      description: HASH_NOT_FOUND_FOR_USER_ID,
    }),
    ApiConflictResponse({
      description: INVALID_VERIFICATION_CODE,
    }),
    ApiUnprocessableEntityResponse({
      description: ERROR_ACTIVATING_USER,
    }),
  );
}
