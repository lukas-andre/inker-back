import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';

import { createDatabaseConnection } from './config';

export const REACTION_DB_CONNECTION_NAME = 'reaction-db';
export const REACTION_DB_CONFIG_NAME = 'reactionDb';

const REACTION_DB_NAME = 'inker-reaction';
const REACTION_ENTITIES = [__dirname + '/../../reactions/**/*.entity{.ts,.js}'];

export type ReactionDbConfig = TypeOrmModuleOptions;

export const reactionDatabaseConf = registerAs<ReactionDbConfig>(
  REACTION_DB_CONFIG_NAME,
  () =>
    createDatabaseConnection({
      name: REACTION_DB_CONNECTION_NAME,
      database: REACTION_DB_NAME,
      entities: REACTION_ENTITIES,
      logging: ['error'],
      keepConnectionAlive: true,
    }),
);
