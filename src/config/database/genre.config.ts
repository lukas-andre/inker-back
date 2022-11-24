import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';

import { createDatabaseConnection } from './config';

export const LOCATION_DB_CONNECTION_NAME = 'genre-db';
export const GENRE_DB_CONFIG_NAME = 'genreDb';

const LOCATION_DB_NAME = 'inker-genre';
const LOCATION_ENTITIES = [__dirname + '/../../genres/**/*.entity{.ts,.js}'];

export type GenreDbConfig = TypeOrmModuleOptions;

export const genreDatabaseConf = registerAs<GenreDbConfig>(
  GENRE_DB_CONFIG_NAME,
  () =>
    createDatabaseConnection({
      name: LOCATION_DB_CONNECTION_NAME,
      database: LOCATION_DB_NAME,
      entities: LOCATION_ENTITIES,
      logging: ['error'],
      keepConnectionAlive: true,
    }),
);
