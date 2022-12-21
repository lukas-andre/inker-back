import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';

import {
  TAG_DB_CONFIG_NAME,
  TAG_DB_CONNECTION_NAME,
} from '../../databases/database.module';

import { createDatabaseConnection } from './config';

const DB_NAME = 'inker-tag';
const ENTITIES = [__dirname + '/../../tags/**/*.entity{.ts,.js}'];

export type TagDbConfig = TypeOrmModuleOptions;

export const tagDatabaseConf = registerAs<TagDbConfig>(TAG_DB_CONFIG_NAME, () =>
  createDatabaseConnection({
    name: TAG_DB_CONNECTION_NAME,
    database: DB_NAME,
    entities: ENTITIES,
    logging: ['error'],
    keepConnectionAlive: true,
  }),
);
