import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';

import { createDatabaseConnection } from './config';

export const REVIEW_DB_CONNECTION_NAME = 'review-db';
export const REVIEW_DB_CONFIG_NAME = 'reviewDb';

const REVIEW_DB_NAME = 'inker-review';
const REVIEW_ENTITIES = [__dirname + '/../../reviews/**/*.entity{.ts,.js}'];

export type ReactionDbConfig = TypeOrmModuleOptions;

export const ratingDatabaseConf = registerAs<ReactionDbConfig>(
  REVIEW_DB_CONFIG_NAME,
  () =>
    createDatabaseConnection({
      name: REVIEW_DB_CONNECTION_NAME,
      database: REVIEW_DB_NAME,
      entities: REVIEW_ENTITIES,
      logging: ['error', 'warn', 'info', 'log', 'migration', 'query', 'schema'],
      keepConnectionAlive: true,
    }),
);
