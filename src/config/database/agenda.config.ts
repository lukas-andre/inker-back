import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';

import { createDatabaseConnection } from './config';

export const AGENDA_DB_CONNECTION_NAME = 'agenda-db';
export const AGENDA_DB_CONFIG_NAME = 'agendaDb';

const AGENDA_DB_NAME = 'inker-agenda';
const AGENDA_ENTITIES = [__dirname + '/../../agenda/**/*.entity{.ts,.js}'];

export type AgendaDbConfig = TypeOrmModuleOptions;

export const agendaDatabaseConf = registerAs<AgendaDbConfig>(
  AGENDA_DB_CONFIG_NAME,
  () =>
    createDatabaseConnection({
      name: AGENDA_DB_CONNECTION_NAME,
      database: AGENDA_DB_NAME,
      entities: AGENDA_ENTITIES,
      logging: ['log', 'error', 'warn', 'info', 'query'],
      keepConnectionAlive: true,
    }),
);
