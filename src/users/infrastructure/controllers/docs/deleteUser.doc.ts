import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { DefaultResponseDto } from '../../../../global/infrastructure/dtos/defaultResponse.dto';

export function DeleteUserDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete current user account' }),
    ApiOkResponse({
      description: 'User has been deleted successfully',
      type: DefaultResponseDto,
    }),
    ApiBadRequestResponse({ description: 'Invalid password' }),
    ApiConflictResponse({ description: 'Unable to delete user' }),
  );
}