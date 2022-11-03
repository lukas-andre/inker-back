import { registerAs } from '@nestjs/config';

import { createDatabaseConnection, TypeOrmConfig } from './config';

export const CUSTOMER_DB_CONNECTION_NAME = 'customer-db';
export const CUSTOMER_DB_CONFIG_NAME = 'customerDb';

const CUSTOMER_DB_NAME = 'inker-customer';
const CUSTOMER_ENTITIES = [__dirname + '/../../customers/**/*.entity{.ts,.js}'];

export type CustomerDbConfig = TypeOrmConfig;

export const customerDatabaseConf = registerAs<CustomerDbConfig>(
  CUSTOMER_DB_CONFIG_NAME,
  () =>
    createDatabaseConnection({
      name: CUSTOMER_DB_CONNECTION_NAME,
      database: CUSTOMER_DB_NAME,
      entities: CUSTOMER_ENTITIES,
      logging: ['error'],
      keepConnectionAlive: true,
    }),
);
