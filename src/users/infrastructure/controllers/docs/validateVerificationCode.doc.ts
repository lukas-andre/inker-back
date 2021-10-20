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
import { VerificationType } from '../../entities/verificationHash.entity';

export function ValidateVerificationCodeDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Validate Verification Code' }),
    ApiParam({
      name: 'userId',
      description: 'User id',
      required: true,
      example: 1,
      type: Number,
    }),
    ApiQuery({
      name: 'type',
      description: 'Sending type event',
      enum: VerificationType,
      example: VerificationType.SMS,
      required: true,
    }),
    ApiOkResponse({
      description: 'Validated',
      type: DefaultResponseDto,
    }),
    ApiNotFoundResponse({ description: 'Hash for user not found' }),
    ApiNotAcceptableResponse({ description: 'User does not exists' }),
    ApiUnprocessableEntityResponse({ description: 'Could not activate user' }),
    ApiConflictResponse({ description: 'Invalid code' }),
  );
}
