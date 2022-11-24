import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';

import { createDatabaseConnection } from './config';

export const LOCATION_DB_CONNECTION_NAME = 'location-db';
export const LOCATION_DB_CONFIG_NAME = 'locationDb';

const LOCATION_DB_NAME = 'inker-location';
const LOCATION_ENTITIES = [__dirname + '/../../locations/**/*.entity{.ts,.js}'];

export type LocationDbConfig = TypeOrmModuleOptions;

export const locationDatabaseConf = registerAs<LocationDbConfig>(
  LOCATION_DB_CONFIG_NAME,
  () =>
    createDatabaseConnection({
      name: LOCATION_DB_CONNECTION_NAME,
      database: LOCATION_DB_NAME,
      entities: LOCATION_ENTITIES,
      logging: ['info', 'query', 'error'],
      keepConnectionAlive: true,
    }),
);
