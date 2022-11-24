import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';

import { createDatabaseConnection } from './config';

export const USER_DB_CONNECTION_NAME = 'user-db';
export const USER_DB_CONFIG_NAME = 'userDb';

const USER_DB_NAME = 'inker-user';
const USER_ENTITIES = [__dirname + '/../../users/**/*.entity{.ts,.js}'];

export type UserDbConfig = TypeOrmModuleOptions;

export const userDatabaseConf = registerAs<UserDbConfig>(
  USER_DB_CONFIG_NAME,
  () =>
    createDatabaseConnection({
      name: USER_DB_CONNECTION_NAME,
      database: USER_DB_NAME,
      entities: USER_ENTITIES,
      logging: ['info', 'query', 'error'],
      keepConnectionAlive: true,
    }),
);
