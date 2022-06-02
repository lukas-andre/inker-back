import { Logger } from '@nestjs/common';
import { ServiceError } from '../../../global/domain/interfaces/serviceError';

export class BaseService {
  protected readonly logger: Logger;
  protected readonly service: string;

  constructor(readonly serviceName: string) {
    this.service = serviceName;
    this.logger = new Logger(serviceName);
  }

  protected serviceError(
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
