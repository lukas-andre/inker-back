import {
  DBServiceCreateException,
  DBServiceDeleteException,
  DBServiceFindException,
  DBServiceFindOneException,
  DBServiceSaveException,
  DBServiceUpdateException,
  DbServiceBadRequest,
  DbServiceBadRule,
  DbServiceConflict,
  DbServiceException,
  DbServiceForbidden,
  DbServiceGatewayTimeout,
  DbServiceInternalServerError,
  DbServiceNotFound,
  DbServiceNotImplemented,
  DbServiceServiceUnavailable,
  DbServiceUnauthorized,
} from '../../infrastructure/exceptions/dbService.exception';
import {
  DomainBadRequest,
  DomainBadRule,
  DomainConflict,
  DomainException,
  DomainForbidden,
  DomainGatewayTimeout,
  DomainInternalServerError,
  DomainNotFound,
  DomainNotImplemented,
  DomainUnProcessableEntity,
  DomainUnauthorized,
} from '../exceptions/domain.exception';

export class DomainResolver {
  public static resolve(exception: DbServiceException): DomainException {
    switch (exception.constructor) {
      case DbServiceBadRule:
        return new DomainBadRule(exception.publicError);
      case DbServiceNotFound:
        return new DomainNotFound(exception.publicError);
      case DbServiceBadRequest:
        return new DomainBadRequest(exception.publicError);
      case DbServiceConflict:
        return new DomainConflict(exception.publicError);
      case DbServiceForbidden:
        return new DomainForbidden(exception.publicError);
      case DbServiceUnauthorized:
        return new DomainUnauthorized(exception.publicError);
      case DbServiceInternalServerError:
      case DbServiceServiceUnavailable:
        return new DomainInternalServerError(exception.publicError);
      case DbServiceGatewayTimeout:
        return new DomainGatewayTimeout(exception.publicError);
      case DbServiceNotImplemented:
        return new DomainNotImplemented(exception.publicError);
      case DBServiceCreateException:
      case DBServiceSaveException:
      case DBServiceUpdateException:
      case DBServiceDeleteException:
      case DBServiceFindException:
      case DBServiceFindOneException:
        return new DomainUnProcessableEntity(exception.publicError);
      default:
        return new DomainInternalServerError('Internal server error');
    }
  }
}
