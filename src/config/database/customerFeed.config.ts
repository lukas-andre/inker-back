import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';

import {
  CUSTOMER_FEED_DB_CONFIG_NAME,
  CUSTOMER_FEED_DB_CONNECTION_NAME,
} from '../../databases/constants';

import { createDatabaseConnection } from './config';

const DB_NAME = 'inker-customer-feed';
const ENTITIES = [__dirname + '/../../customer-feed/**/*.entity{.ts,.js}'];

export type CustomerFeedDbConfig = TypeOrmModuleOptions;

export const customerFeedDatabaseConf = registerAs<CustomerFeedDbConfig>(
  CUSTOMER_FEED_DB_CONFIG_NAME,
  () =>
    createDatabaseConnection({
      name: CUSTOMER_FEED_DB_CONNECTION_NAME,
      database: DB_NAME,
      entities: ENTITIES,
      logging: ['error'],
      keepConnectionAlive: true,
    }),
);
