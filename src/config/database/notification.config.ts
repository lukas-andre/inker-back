import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';

import {
  NOTIFICATIONS_DB_CONFIG_NAME,
  NOTIFICATIONS_DB_CONNECTION_NAME,
} from '../../databases/constants';

import { createDatabaseConnection } from './config';

const DB_NAME = 'inker-notification';
const ENTITIES = [__dirname + '/../../notifications/**/*.entity{.ts,.js}'];

export type NotificationsDbConfig = TypeOrmModuleOptions;

export const notificationsDatabaseConf = registerAs<NotificationsDbConfig>(
  NOTIFICATIONS_DB_CONFIG_NAME,
  () =>
    createDatabaseConnection({
      name: NOTIFICATIONS_DB_CONNECTION_NAME,
      database: DB_NAME,
      entities: ENTITIES,
      logging: ['info', 'query', 'error'],
      keepConnectionAlive: true,
    }),
);
