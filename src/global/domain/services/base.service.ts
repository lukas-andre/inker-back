import { Logger } from '@nestjs/common';
import { ServiceError } from '../../../global/domain/interfaces/serviceError';

export class BaseService {
  public readonly logger: Logger;
  public readonly service;
  constructor(readonly serviceName) {
    this.service = serviceName;
    this.logger = new Logger(serviceName);
  }

  public serviceError(
    method: { name: string },
    publicError: string,
    catchedErrorMessage?: unknown,
  ): ServiceError {
    return {
      method: method.name,
      service: this.service,
      publicErrorMessage: publicError,
      catchedErrorMessage,
    };
  }
}
