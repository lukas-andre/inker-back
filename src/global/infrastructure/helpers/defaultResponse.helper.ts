import {
  DefaultResponseDto,
  DefaultResponseStatus,
} from '../dtos/defaultResponse.dto';

export class DefaultResponse {
  static ok: DefaultResponseDto = {
    status: DefaultResponseStatus.OK,
  };

  static created: DefaultResponseDto = {
    status: DefaultResponseStatus.CREATED,
  };

  static failure: DefaultResponseDto = {
    status: DefaultResponseStatus.FAILURE,
  };

  static unknown: DefaultResponseDto = {
    status: DefaultResponseStatus.UNKNOWN,
  };

  static createResponse(
    status: DefaultResponseStatus,
    data?: Record<string, any> | string | boolean | number,
  ): DefaultResponseDto {
    return {
      status: status,
      data: data,
    };
  }
}
