import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';

import {
  FOLLOW_DB_CONFIG_NAME,
  FOLLOW_DB_CONNECTION_NAME,
} from '../../databases/database.module';

import { createDatabaseConnection } from './config';

const DB_NAME = 'inker-follow';
const ENTITIES = [__dirname + '/../../follows/**/*.entity{.ts,.js}'];

export type FollowDbConfig = TypeOrmModuleOptions;

export const followDatabaseConf = registerAs<FollowDbConfig>(
  FOLLOW_DB_CONFIG_NAME,
  () =>
    createDatabaseConnection({
      name: FOLLOW_DB_CONNECTION_NAME,
      database: DB_NAME,
      entities: ENTITIES,
      logging: ['error'],
      keepConnectionAlive: true,
    }),
);
