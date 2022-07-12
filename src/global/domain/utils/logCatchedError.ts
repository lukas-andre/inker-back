import { Logger } from '@nestjs/common';
import stringify from 'fast-safe-stringify';

export function logCatchedError(error: any, logger: Logger): void {
  error = typeof error === 'string' ? error : stringify(error);
  logger.log(`Error: ${error}`);
}
