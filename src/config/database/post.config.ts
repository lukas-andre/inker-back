import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';

import {
  POST_DB_CONFIG_NAME,
  POST_DB_CONNECTION_NAME,
} from '../../databases/database.module';

import { createDatabaseConnection } from './config';

const DB_NAME = 'inker-post';
const ENTITIES = [__dirname + '/../../posts/**/*.entity{.ts,.js}'];

export type PostDbConfig = TypeOrmModuleOptions;

export const postDatabaseConf = registerAs<PostDbConfig>(
  POST_DB_CONFIG_NAME,
  () =>
    createDatabaseConnection({
      name: POST_DB_CONNECTION_NAME,
      database: DB_NAME,
      entities: ENTITIES,
      logging: ['error'],
      keepConnectionAlive: true,
    }),
);
