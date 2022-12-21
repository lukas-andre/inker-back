import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';

import {
  GENRE_DB_CONFIG_NAME,
  GENRE_DB_CONNECTION_NAME,
} from '../../databases/database.module';

import { createDatabaseConnection } from './config';

const DB_NAME = 'inker-genre';
const ENTITIES = [__dirname + '/../../genres/**/*.entity{.ts,.js}'];

export type GenreDbConfig = TypeOrmModuleOptions;

export const genreDatabaseConf = registerAs<GenreDbConfig>(
  GENRE_DB_CONFIG_NAME,
  () =>
    createDatabaseConnection({
      name: GENRE_DB_CONNECTION_NAME,
      database: DB_NAME,
      entities: ENTITIES,
      logging: ['error'],
      keepConnectionAlive: true,
    }),
);
