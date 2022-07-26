import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { errorCodesToOASDescription } from '../../../../global/infrastructure/helpers/errorCodesToOASDescription.helper';
import {
  ARTIST_ALREADY_EXISTS,
  PROBLEMS_SAVING_AGENDA_FOR_USER,
  PROBLEMS_SAVING_ARTIST,
  ROLE_DOES_NOT_EXIST,
  TROUBLE_SAVING_LOCATION,
  USER_ALREADY_EXISTS,
} from '../../../domain/errors/codes';
import { CreateArtistUserResDto } from '../../dtos/createUserRes.dto';

export function CreateUserDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Create User' }),
    ApiCreatedResponse({
      description: 'Users has been created',
      type: CreateArtistUserResDto,
    }),
    ApiBadRequestResponse({
      description: errorCodesToOASDescription([
        USER_ALREADY_EXISTS,
        ARTIST_ALREADY_EXISTS,
      ]),
    }),
    ApiConflictResponse({ description: ROLE_DOES_NOT_EXIST }),
    ApiUnprocessableEntityResponse({
      description: errorCodesToOASDescription([
        PROBLEMS_SAVING_ARTIST,
        PROBLEMS_SAVING_AGENDA_FOR_USER,
        TROUBLE_SAVING_LOCATION,
      ]),
    }),
  );
}
