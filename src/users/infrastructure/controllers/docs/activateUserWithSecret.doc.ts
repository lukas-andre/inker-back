import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiBody,
} from '@nestjs/swagger';
import { ActivateUserWithSecretReqDto } from '../../dtos/activateUserWithSecret.dto';

export function ActivateUserWithSecretDoc() {
  return applyDecorators(
    ApiTags('users'),
    ApiOperation({
      summary: 'Activate a user account with a secret key',
      description: 'Activates a user account using the provided secret key',
    }),
    ApiParam({
      name: 'userId',
      type: String,
      description: 'ID of the user to activate',
    }),
    ApiBody({
      type: ActivateUserWithSecretReqDto,
      description: 'Secret key for activating the user',
    }),
    ApiResponse({
      status: 200,
      description: 'User successfully activated',
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid request (missing/invalid parameters or user not found)',
    }),
    ApiResponse({
      status: 403,
      description: 'Invalid secret key',
    }),
  );
} 