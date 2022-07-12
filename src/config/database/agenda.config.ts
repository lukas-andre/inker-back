import { registerAs } from '@nestjs/config';
import { createDatabaseConnection, TypeOrmConfig } from './config';

export const AGENDA_DB_CONNECTION_NAME = 'agenda-db';
export const AGENDA_DB_CONFIG_NAME = 'agendaDb';

const AGENDA_DB_NAME = 'inker-agenda';
const AGENDA_ENTITIES = [__dirname + '/../../agenda/**/*.entity{.ts,.js}'];

export type AgendateDbConfig = TypeOrmConfig;

export const agendaDatabaseConf = registerAs<AgendateDbConfig>(
  AGENDA_DB_CONFIG_NAME,
  () =>
    createDatabaseConnection({
      name: AGENDA_DB_CONNECTION_NAME,
      database: AGENDA_DB_NAME,
      entities: AGENDA_ENTITIES,
      logging: ['info', 'query', 'error'],
      keepConnectionAlive: true,
    }),
);
