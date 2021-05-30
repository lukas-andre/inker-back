import { Logger } from '@nestjs/common';
import * as stringify from 'json-stringify-safe';

export function logCatchedError(error: any, logger: Logger): void {
  error = typeof error === 'string' ? error : stringify(error);
  logger.log(`Error: ${error}`);
}
