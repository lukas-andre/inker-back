import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';

import {
  ARTIST_DB_CONFIG_NAME,
  ARTIST_DB_CONNECTION_NAME,
} from '../../databases/constants';

import { createDatabaseConnection } from './config';

const DB_NAME = 'inker-artist';
const ENTITIES = [
  __dirname + '/../../artists/**/*.entity{.ts,.js}',
  __dirname + '/../../interactions/**/*.entity{.ts,.js}',
  __dirname + '/../../tags/tag.entity{.ts,.js}',
];

export type ArtistDbConfig = TypeOrmModuleOptions;

export const artistDatabaseConf = registerAs<ArtistDbConfig>(
  ARTIST_DB_CONFIG_NAME,
  () =>
    createDatabaseConnection({
      name: ARTIST_DB_CONNECTION_NAME,
      database: DB_NAME,
      entities: ENTITIES,
      logging: ['info', 'query', 'error'],
      keepConnectionAlive: true,
    }),
);
