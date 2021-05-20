import { Logger } from '@nestjs/common';
import * as stringify from 'json-stringify-safe';
import { ServiceError } from '../interfaces/serviceError';

export function handleServiceError(
  serviceError: ServiceError,
  errorMessage?: string,
): string {
  const logger = new Logger(serviceError.subject);
  const error =
    typeof serviceError.error === 'string'
      ? serviceError.error
      : stringify(serviceError);

  logger.log(`Error: ${error}, Method: ${serviceError.method}`);
  return errorMessage ? errorMessage : error;
}
