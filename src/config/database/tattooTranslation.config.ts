import { join } from 'path';
import { registerAs } from '@nestjs/config';

import { createDatabaseConnection } from './config';
import { TATTOO_TRANSLATION_DB_CONFIG_NAME, TATTOO_TRANSLATION_DB_CONNECTION_NAME } from '../../databases/constants';

export const DB_NAME = 'inker-tattoo-generation';

export const tattooTranslationDatabaseConf = registerAs(
  TATTOO_TRANSLATION_DB_CONFIG_NAME,
  () =>
    createDatabaseConnection({
      name: TATTOO_TRANSLATION_DB_CONNECTION_NAME,
      database: DB_NAME,
      entities: [join(__dirname, '../../tattoo-generator/infrastructure/entities/*.entity{.ts,.js}')],
      logging: 'all',
      keepConnectionAlive: true,
      cache: true,
    }),
); 