import { Logger } from '@nestjs/common';
import { ServiceError } from '../interfaces/serviceError';
import * as stringify from 'json-stringify-safe';

export function handleServiceError(
  serviceError: ServiceError,
  logger: Logger,
  errorMessage?: string,
): string {
  const catchedErrorMessage =
    typeof serviceError.catchedErrorMessage === 'string'
      ? serviceError.catchedErrorMessage
      : stringify(serviceError.catchedErrorMessage);

  logger.error(
    `Service: ${serviceError.service} Method: ${serviceError.method} Catched error message: ${catchedErrorMessage}`,
  );
  return errorMessage ? errorMessage : serviceError.publicErrorMessage;
}
