import { registerAs } from '@nestjs/config';
import { createDatabaseConnection, TypeOrmConfig } from './config';

export const FOLLOW_DB_CONNECTION_NAME = 'follow-db';
export const FOLLOW_DB_CONFIG_NAME = 'followDb';

const FOLLOW_DB_NAME = 'inker-follow';
const FOLLOW_ENTITIES = [__dirname + '/../../follows/**/*.entity{.ts,.js}'];

export type FollowDbConfig = TypeOrmConfig;

export const followDatabaseConf = registerAs<FollowDbConfig>(
  FOLLOW_DB_CONFIG_NAME,
  () =>
    createDatabaseConnection({
      name: FOLLOW_DB_CONNECTION_NAME,
      database: FOLLOW_DB_NAME,
      entities: FOLLOW_ENTITIES,
      logging: ['error'],
      keepConnectionAlive: true,
    }),
);
