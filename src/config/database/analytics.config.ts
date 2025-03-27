import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';

import {
  ANALYTICS_DB_CONFIG_NAME,
  ANALYTICS_DB_CONNECTION_NAME,
} from '../../databases/constants';

import { createDatabaseConnection } from './config';

const DB_NAME = 'inker-analytics';
const ENTITIES = [
  __dirname + '/../../analytics/**/*.entity{.ts,.js}',
];

export type AnalyticsDbConfig = TypeOrmModuleOptions;

export const analyticsDatabaseConf = registerAs<AnalyticsDbConfig>(
  ANALYTICS_DB_CONFIG_NAME,
  () =>
    createDatabaseConnection({
      name: ANALYTICS_DB_CONNECTION_NAME,
      database: DB_NAME,
      entities: ENTITIES,
      logging: ['info', 'query', 'error'],
      keepConnectionAlive: true,
      cache: true,
    }),
); 