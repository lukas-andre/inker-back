import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';

import { createDatabaseConnection } from './config';

export const TAG_DB_CONNECTION_NAME = 'tag-db';
export const TAG_DB_CONFIG_NAME = 'tagDb';

const TAG_DB_NAME = 'inker-tag';
const TAG_ENTITIES = [__dirname + '/../../tags/**/*.entity{.ts,.js}'];

export type TagDbConfig = TypeOrmModuleOptions;

export const tagDatabaseConf = registerAs<TagDbConfig>(TAG_DB_CONFIG_NAME, () =>
  createDatabaseConnection({
    name: TAG_DB_CONNECTION_NAME,
    database: TAG_DB_NAME,
    entities: TAG_ENTITIES,
    logging: ['error'],
    keepConnectionAlive: true,
  }),
);
