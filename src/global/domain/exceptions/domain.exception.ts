export abstract class DomainException extends Error {
  readonly response: string | Record<string, any>;

  constructor(response: string | Record<string, any>) {
    super();
    this.response = response;
  }
}

export class DomainBadRule extends DomainException {}

export class DomainNotFound extends DomainException {}

export class DomainBadRequest extends DomainException {}

export class DomainConflict extends DomainException {}

export class DomainUnauthorized extends DomainException {}

export class DomainForbidden extends DomainException {}

export class DomainInternalServerError extends DomainException {}

export class DomainUnProcessableEntity extends DomainException {}

export class DomainNotImplemented extends DomainException {}

export class DomainNotAcceptable extends DomainException {}

export class DomainGatewayTimeout extends DomainException {}
