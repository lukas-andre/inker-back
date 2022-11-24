import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';

import { createDatabaseConnection } from './config';

export const ARTIST_DB_CONNECTION_NAME = 'artist-db';
export const ARTIST_DB_CONFIG_NAME = 'artistDb';

const ARTIST_DB_NAME = 'inker-artist';
const ARTIST_ENTITIES = [__dirname + '/../../artists/**/*.entity{.ts,.js}'];

export type ArtistDbConfig = TypeOrmModuleOptions;

export const artistDatabaseConf = registerAs<ArtistDbConfig>(
  ARTIST_DB_CONFIG_NAME,
  () =>
    createDatabaseConnection({
      name: ARTIST_DB_CONNECTION_NAME,
      database: ARTIST_DB_NAME,
      entities: ARTIST_ENTITIES,
      logging: ['info', 'query', 'error'],
      keepConnectionAlive: true,
    }),
);
