import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import {
  ARTIST_ALREADY_EXISTS,
  PROBLEMS_SAVING_AGENDA_FOR_USER,
  PROBLEMS_SAVING_ARTIST,
  ROLE_DOES_NOT_EXIST,
  TROUBLE_SAVING_LOCATION,
  USER_ALREADY_EXISTS,
} from '../../../domain/errors/codes';
import { CreateArtistUserResDto } from '../../dtos/createUserRes.dto';

function errorCodesToErrorDescription(errorsCodes: string[]): string {
  return errorsCodes.join('\n');
}

export function CreateUserDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Create User' }),
    ApiCreatedResponse({
      description: 'Users has been created',
      type: CreateArtistUserResDto,
    }),
    ApiBadRequestResponse({
      // description: 'User already exists | Artist already exists',
      description: errorCodesToErrorDescription([
        USER_ALREADY_EXISTS,
        ARTIST_ALREADY_EXISTS,
      ]),
    }),
    ApiConflictResponse({ description: ROLE_DOES_NOT_EXIST }),
    ApiUnprocessableEntityResponse({
      description: errorCodesToErrorDescription([
        PROBLEMS_SAVING_ARTIST,
        PROBLEMS_SAVING_AGENDA_FOR_USER,
        TROUBLE_SAVING_LOCATION,
      ]),
    }),
  );
}
