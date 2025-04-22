import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBody,
} from '@nestjs/swagger';
import { ActivateUserByEmailReqDto } from '../../dtos/activateUserByEmail.dto';

export function ActivateUserByEmailDoc() {
  return applyDecorators(
    ApiTags('users'),
    ApiOperation({
      summary: 'Activate a user account by email',
      description: 'Activates a user account using the provided email address',
    }),
    ApiBody({
      type: ActivateUserByEmailReqDto,
      description: 'The email of the user to activate',
    }),
    ApiResponse({
      status: 200,
      description: 'User successfully activated',
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid request (missing/invalid parameters or user not found)',
    }),
  );
} 