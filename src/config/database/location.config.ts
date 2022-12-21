import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';

import {
  LOCATION_DB_CONFIG_NAME,
  LOCATION_DB_CONNECTION_NAME,
} from '../../databases/database.module';

import { createDatabaseConnection } from './config';

const DB_NAME = 'inker-location';
const ENTITIES = [__dirname + '/../../locations/**/*.entity{.ts,.js}'];

export type LocationDbConfig = TypeOrmModuleOptions;

export const locationDatabaseConf = registerAs<LocationDbConfig>(
  LOCATION_DB_CONFIG_NAME,
  () =>
    createDatabaseConnection({
      name: LOCATION_DB_CONNECTION_NAME,
      database: DB_NAME,
      entities: ENTITIES,
      logging: ['info', 'query', 'error'],
      keepConnectionAlive: true,
    }),
);
