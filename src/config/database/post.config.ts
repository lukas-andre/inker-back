import { registerAs } from '@nestjs/config';

import { createDatabaseConnection, TypeOrmConfig } from './config';

export const POST_DB_CONNECTION_NAME = 'post-db';
export const POST_DB_CONFIG_NAME = 'postDb';

const POST_DB_NAME = 'inker-post';
const POST_ENTITIES = [__dirname + '/../../posts/**/*.entity{.ts,.js}'];

export type PostDbConfig = TypeOrmConfig;

export const postDatabaseConf = registerAs<PostDbConfig>(
  POST_DB_CONFIG_NAME,
  () =>
    createDatabaseConnection({
      name: POST_DB_CONNECTION_NAME,
      database: POST_DB_NAME,
      entities: POST_ENTITIES,
      logging: ['error'],
      keepConnectionAlive: true,
    }),
);
