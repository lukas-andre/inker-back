import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { DefaultResponseDto } from '../../../../global/infrastructure/dtos/defaultResponse.dto';

export function UpdateUserUsernameDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Update User Username' }),
    ApiOkResponse({
      description: 'User username has been updated',
      type: DefaultResponseDto,
    }),
    ApiBadRequestResponse({ description: 'User not found' }),
  );
}
