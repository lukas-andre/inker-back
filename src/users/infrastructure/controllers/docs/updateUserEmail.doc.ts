import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { DefaultResponseDto } from '../../../../global/infrastructure/dtos/defaultResponse.dto';

export function UpdateUserEmailDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Update User Email' }),
    ApiOkResponse({
      description: 'User email has been updated',
      type: DefaultResponseDto,
    }),
    ApiBadRequestResponse({ description: 'User not found' }),
  );
}
