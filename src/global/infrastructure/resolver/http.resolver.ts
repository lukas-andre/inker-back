import {
  BadRequestException,
  ConflictException,
  GatewayTimeoutException,
  HttpException,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
  NotImplementedException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';

import {
  DomainBadRule,
  DomainConflict,
  DomainException,
  DomainForbidden,
  DomainGatewayTimeout,
  DomainInternalServerError,
  DomainNotAcceptable,
  DomainNotFound,
  DomainNotImplemented,
  DomainUnProcessableEntity,
  DomainUnauthorized,
} from '../../domain/exceptions/domain.exception';

export class HttpResolver {
  public static resolve(exception: DomainException): HttpException {
    switch (exception.constructor) {
      case DomainBadRule:
        return new BadRequestException(exception.response);
      case DomainConflict:
        return new ConflictException(exception.response);
      case DomainInternalServerError:
        return new InternalServerErrorException(exception.response);
      case DomainNotFound:
        return new NotFoundException(exception.response);
      case DomainUnProcessableEntity:
        return new UnprocessableEntityException(exception.response);
      case DomainUnauthorized:
        return new UnauthorizedException(exception.response);
      case DomainForbidden:
        return new UnauthorizedException(exception.response);
      case DomainInternalServerError:
        return new InternalServerErrorException(exception.response);
      case DomainNotImplemented:
        return new NotImplementedException(exception.response);
      case DomainNotAcceptable:
        return new NotAcceptableException(exception.response);
      case DomainGatewayTimeout:
        return new GatewayTimeoutException(exception.response);
      default:
        return new InternalServerErrorException(exception.response);
    }
  }
}
