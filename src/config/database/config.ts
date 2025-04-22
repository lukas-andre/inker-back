import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import Joi from 'joi';
import { LoggerOptions } from 'typeorm/logger/LoggerOptions';

import { oasConfig } from '../oas.config';

import { agendaDatabaseConf } from './agenda.config';
import { artistDatabaseConf } from './artist.config';
import { customerDatabaseConf } from './customer.config';
import { customerFeedDatabaseConf } from './customerFeed.config';
import { followDatabaseConf } from './follow.config';
import { genreDatabaseConf } from './genre.config';
import { locationDatabaseConf } from './location.config';
import { postDatabaseConf } from './post.config';
import { reactionDatabaseConf } from './reaction.config';
import { ratingDatabaseConf } from './review.config';
import { tagDatabaseConf } from './tag.config';
import { userDatabaseConf } from './user.config';
import { notificationsDatabaseConf } from './notification.config';
import { analyticsDatabaseConf } from './analytics.config';

type DataBaseTypes = 'postgres';

// Basic configuration for the database, this var are pass by env variables except for the database type
type DatabaseConfig = {
  type: DataBaseTypes;
  host: string;
  username: string;
  password: string;
  port: number;
};

// Helper function for get the base info to configure multiples databases
export const getBaseDatabaseConfig = (): DatabaseConfig => ({
  type: 'postgres',
  host: process.env.DB_HOST || '0.0.0.0',
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'root',
  port: parseInt(process.env.DB_PORT, 10),
});

// This configuration can change depending on the database
type ConnectionConfig = {
  name: string;
  database: string;
  entities: string[];
  logging: LoggerOptions;
  keepConnectionAlive: boolean;
  synchronize?: boolean;
  cache?: boolean;
};

// This type can be extended by the database configuration
export type TypeOrmConfig = DatabaseConfig & ConnectionConfig;

// Helper function for get the base info to configure multiples databases
export function createDatabaseConnection(
  connectionConf: ConnectionConfig,
): TypeOrmModuleOptions {
  return {
    ...getBaseDatabaseConfig(),
    synchronize: false,
    name: connectionConf.name,
    database: connectionConf.database,
    entities: connectionConf.entities,
    logging: connectionConf.logging,
    keepConnectionAlive: connectionConf.keepConnectionAlive,
    cache: connectionConf.cache,
  };
}

// This configuration is created to validate the env variables
export const databaseConfig = registerAs<DatabaseConfig>(
  'database',
  getBaseDatabaseConfig,
);

// Validation of the database config env variables
export const databaseConfigSchema = Joi.object({
  HOST: Joi.string().hostname().default('0.0.0.0'),
  USERNAME: Joi.string().default('root'),
  PASSWORD: Joi.string().default('root'),
  PORT: Joi.number().default(5432),
  TYPEORM_SYNC: Joi.number().default(0),
});

// If you add a new database, you need to add a new configuration here
export const databaseConfigs = [
  userDatabaseConf,
  artistDatabaseConf,
  customerDatabaseConf,
  followDatabaseConf,
  reactionDatabaseConf,
  postDatabaseConf,
  genreDatabaseConf,
  ratingDatabaseConf,
  tagDatabaseConf,
  agendaDatabaseConf,
  locationDatabaseConf,
  customerFeedDatabaseConf,
  oasConfig,
  notificationsDatabaseConf,
  analyticsDatabaseConf,
];
