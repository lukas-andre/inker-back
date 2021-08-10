import { ServiceError } from '../../../global/domain/interfaces/serviceError';
import { DomainException } from '../exceptions/domain.exception';
import { BaseService } from '../services/base.service';
import * as stringify from 'json-stringify-safe';

export class BaseUseCase extends BaseService {
  constructor(readonly serviceName: string) {
    super(serviceName);
  }

  public async execute(...args: any[]): Promise<any | DomainException> {}

  public handleServiceError(
    serviceError: ServiceError,
    errorMessage?: string,
  ): string {
    const catchedErrorMessage =
      typeof serviceError.catchedErrorMessage === 'string'
        ? serviceError.catchedErrorMessage
        : stringify(serviceError.catchedErrorMessage);

    this.logger.error(
      stringify({
        service: serviceError.service,
        method: serviceError.method,
        message: serviceError.publicErrorMessage,
        error: catchedErrorMessage,
      }),
    );
    return errorMessage ? errorMessage : serviceError.publicErrorMessage;
  }
}
