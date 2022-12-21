import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';

import {
  REACTION_DB_CONFIG_NAME,
  REACTION_DB_CONNECTION_NAME,
} from '../../databases/database.module';

import { createDatabaseConnection } from './config';

const DB_NAME = 'inker-reaction';
const ENTITIES = [__dirname + '/../../reactions/**/*.entity{.ts,.js}'];

export type ReactionDbConfig = TypeOrmModuleOptions;

export const reactionDatabaseConf = registerAs<ReactionDbConfig>(
  REACTION_DB_CONFIG_NAME,
  () =>
    createDatabaseConnection({
      name: REACTION_DB_CONNECTION_NAME,
      database: DB_NAME,
      entities: ENTITIES,
      logging: ['error'],
      keepConnectionAlive: true,
    }),
);
