import { Logger } from '@nestjs/common';

import { BaseComponent } from '../../domain/components/base.component';

export abstract class DbServiceException extends Error {
  public readonly publicError: string;
  public readonly service: string;
  public readonly error?: any;

  constructor({ name }: BaseComponent, publicError: string, error: any = null) {
    super(publicError);
    this.publicError = publicError;
    this.error = error;
    this.service = name;
    if (error) {
      Logger.error(error, `${this.service}`);
    }
  }
}

export class DbServiceBadRule extends DbServiceException {}

export class DbServiceNotFound extends DbServiceException {}

export class DbServiceBadRequest extends DbServiceException {}

export class DbServiceConflict extends DbServiceException {}

export class DbServiceUnauthorized extends DbServiceException {}

export class DbServiceForbidden extends DbServiceException {}

export class DbServiceInternalServerError extends DbServiceException {}

export class DbServiceNotImplemented extends DbServiceException {}

export class DbServiceServiceUnavailable extends DbServiceException {}

export class DbServiceGatewayTimeout extends DbServiceException {}

export class DBServiceCreateException extends DbServiceException {}

export class DBServiceSaveException extends DbServiceException {}

export class DBServiceUpdateException extends DbServiceException {}

export class DBServiceDeleteException extends DbServiceException {}

export class DBServiceFindException extends DbServiceException {}

export class DBServiceFindOneException extends DbServiceException {}
