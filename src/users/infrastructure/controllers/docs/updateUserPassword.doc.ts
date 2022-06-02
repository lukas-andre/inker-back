import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { DefaultResponseDto } from '../../../../global/infrastructure/dtos/defaultResponse.dto';

export function UpdateUserPasswordDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Update User password' }),
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
    ApiOkResponse({
      description: 'User email has been updated',
      type: DefaultResponseDto,
    }),
    ApiBadRequestResponse({ description: 'User not found' }),
  );
}
