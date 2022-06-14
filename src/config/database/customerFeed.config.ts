import { registerAs } from '@nestjs/config';
import { createDatabaseConnection, TypeOrmConfig } from './config';

export const CUSTOMER_FEED_DB_CONNECTION_NAME = 'customer-feed-db';
export const CUSTOMER_FEED_DB_CONFIG_NAME = 'customerFeedDb';

const CUSTOMER_FEED_DB_NAME = 'inker-customer-feed';
const CUSTOMER_FEED_ENTITIES = [
  __dirname + '/../../customer-feed/**/*.entity{.ts,.js}',
];

export type CustomerFeedDbConfig = TypeOrmConfig;

export const customerFeedDatabaseConf = registerAs<CustomerFeedDbConfig>(
  CUSTOMER_FEED_DB_CONFIG_NAME,
  () =>
    createDatabaseConnection({
      name: CUSTOMER_FEED_DB_CONNECTION_NAME,
      database: CUSTOMER_FEED_DB_NAME,
      entities: CUSTOMER_FEED_ENTITIES,
      logging: ['error'],
      keepConnectionAlive: true,
    }),
);
