import { join } from 'path';

import { registerAs } from '@nestjs/config';

import {
  TATTOO_TRANSLATION_DB_CONFIG_NAME,
  TATTOO_TRANSLATION_DB_CONNECTION_NAME,
} from '../../databases/constants';

import { createDatabaseConnection } from './config';

export const DB_NAME = 'inker-tattoo-generation';

export const tattooTranslationDatabaseConf = registerAs(
  TATTOO_TRANSLATION_DB_CONFIG_NAME,
  () =>
    createDatabaseConnection({
      name: TATTOO_TRANSLATION_DB_CONNECTION_NAME,
      database: DB_NAME,
      entities: [
        join(
          __dirname,
          '../../tattoo-generator/infrastructure/entities/*.entity{.ts,.js}',
        ),
      ],
      logging: ['error'],
      keepConnectionAlive: true,
      cache: true,
    }),
);
