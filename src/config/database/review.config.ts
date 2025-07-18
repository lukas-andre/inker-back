import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';

import {
  REVIEW_DB_CONFIG_NAME,
  REVIEW_DB_CONNECTION_NAME,
} from '../../databases/constants';

import { createDatabaseConnection } from './config';

const DB_NAME = 'inker-review';
const ENTITIES = [__dirname + '/../../reviews/**/*.entity{.ts,.js}'];

export type ReactionDbConfig = TypeOrmModuleOptions;

export const ratingDatabaseConf = registerAs<ReactionDbConfig>(
  REVIEW_DB_CONFIG_NAME,
  () =>
    createDatabaseConnection({
      name: REVIEW_DB_CONNECTION_NAME,
      database: DB_NAME,
      entities: ENTITIES,
      logging: ['error'],
      keepConnectionAlive: true,
    }),
);
