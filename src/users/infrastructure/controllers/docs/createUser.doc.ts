import { applyDecorators } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { CreateUserResDto } from '../../dtos/createUserRes.dto';

export function CreateUserDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Create User' }),
    ApiCreatedResponse({
      description: 'Users has been created',
      type: CreateUserResDto,
    }),
    ApiNotFoundResponse({ description: 'Rol does not exists' }),
    ApiConflictResponse({ description: 'Users already exists' }),
  );
}
