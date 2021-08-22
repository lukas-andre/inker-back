import { applyDecorators } from '@nestjs/common';
import {
  ApiNotAcceptableResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
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
    ApiNotAcceptableResponse({ description: 'User does not exists' }),
  );
}
