import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotAcceptableResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';

import { DefaultResponseDto } from '../../../../global/infrastructure/dtos/defaultResponse.dto';
import { errorCodesToOASDescription } from '../../../../global/infrastructure/helpers/errorCodesToOASDescription.helper';
import {
  MAX_SMS_ATTEMPTS_REACHED,
  PROBLEMS_CREATING_VERIFICATION_HASH,
  USER_ALREADY_VERIFIED,
  USER_ID_IS_NOT_VALID,
  USER_NOT_ACCEPTED,
} from '../../../domain/errors/codes';
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
    ApiNotAcceptableResponse({
      description: USER_NOT_ACCEPTED,
    }),
    ApiBadRequestResponse({
      description: errorCodesToOASDescription([
        USER_ID_IS_NOT_VALID,
        USER_ALREADY_VERIFIED,
        MAX_SMS_ATTEMPTS_REACHED,
      ]),
    }),
    ApiUnprocessableEntityResponse({
      description: PROBLEMS_CREATING_VERIFICATION_HASH,
    }),
    // Api
  );
}
