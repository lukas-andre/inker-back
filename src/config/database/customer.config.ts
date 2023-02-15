import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';

import {
  CUSTOMER_DB_CONFIG_NAME,
  CUSTOMER_DB_CONNECTION_NAME,
} from '../../databases/constants';

import { createDatabaseConnection } from './config';

const DB_NAME = 'inker-customer';
const ENTITIES = [__dirname + '/../../customers/**/*.entity{.ts,.js}'];

export type CustomerDbConfig = TypeOrmModuleOptions;

export const customerDatabaseConf = registerAs<CustomerDbConfig>(
  CUSTOMER_DB_CONFIG_NAME,
  () =>
    createDatabaseConnection({
      name: CUSTOMER_DB_CONNECTION_NAME,
      database: DB_NAME,
      entities: ENTITIES,
      logging: ['error'],
      keepConnectionAlive: true,
    }),
);
