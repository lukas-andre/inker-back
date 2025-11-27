import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';

import {
  USER_DB_CONFIG_NAME,
  USER_DB_CONNECTION_NAME,
} from '../../databases/constants';

import { createDatabaseConnection } from './config';

const DB_NAME = 'inker-user';
const ENTITIES = [__dirname + '/../../users/**/*.entity{.ts,.js}'];

export type UserDbConfig = TypeOrmModuleOptions;

export const userDatabaseConf = registerAs<UserDbConfig>(
  USER_DB_CONFIG_NAME,
  () =>
    createDatabaseConnection({
      name: USER_DB_CONNECTION_NAME,
      database: DB_NAME,
      entities: ENTITIES,
      logging: ['error'],
      keepConnectionAlive: true,
    }),
);
