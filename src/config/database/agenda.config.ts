import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';

import {
  AGENDA_DB_CONFIG_NAME,
  AGENDA_DB_CONNECTION_NAME,
} from '../../databases/constants';

import { createDatabaseConnection } from './config';

const DB_NAME = 'inker-agenda';
const ENTITIES = [__dirname + '/../../agenda/**/*.entity{.ts,.js}'];

export type AgendaDbConfig = TypeOrmModuleOptions;

export const agendaDatabaseConf = registerAs<AgendaDbConfig>(
  AGENDA_DB_CONFIG_NAME,
  () =>
    createDatabaseConnection({
      name: AGENDA_DB_CONNECTION_NAME,
      database: DB_NAME,
      entities: ENTITIES,
      logging: ['error', 'warn', 'info', 'log', 'migration', 'query', 'schema'],
      keepConnectionAlive: true,
    }),
);
