import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';

import {
  TOKENS_DB_CONFIG_NAME,
  TOKENS_DB_CONNECTION_NAME,
} from '../../databases/constants';

import { createDatabaseConnection } from './config';

const DB_NAME = 'inker-tokens';
const ENTITIES = [__dirname + '/../../tokens/**/*.entity{.ts,.js}'];

export type TokensDbConfig = TypeOrmModuleOptions;

export const tokensDatabaseConf = registerAs<TokensDbConfig>(
  TOKENS_DB_CONFIG_NAME,
  () =>
    createDatabaseConnection({
      name: TOKENS_DB_CONNECTION_NAME,
      database: DB_NAME,
      entities: ENTITIES,
      logging: ['error'],
      keepConnectionAlive: true,
    }),
);