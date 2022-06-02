import {
  DefaultResponseDto,
  DefaultResponseStatus,
} from '../dtos/defaultResponse.dto';

export class DefaultResponseHelper {
  static ok: DefaultResponseDto = {
    status: DefaultResponseStatus.OK,
  };

  static failure: DefaultResponseDto = {
    status: DefaultResponseStatus.FAILURE,
  };

  static unknown: DefaultResponseDto = {
    status: DefaultResponseStatus.UNKNOWN,
  };
}
