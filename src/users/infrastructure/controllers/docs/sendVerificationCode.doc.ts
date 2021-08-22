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
import { VerificationType } from '../../entities/verificationHash.entity';

export function SendVerificationCodeDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Send SMS Verification Code' }),
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
      name: 'type',
      description: 'Sending type event',
      enum: VerificationType,
      example: VerificationType.SMS,
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
