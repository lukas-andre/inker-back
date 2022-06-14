import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';
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
import { tagDatabaseConf } from './tag.config';
import { userDatabaseConf } from './user.config';

// Basic configuration for the database, this var are pass by env variables exept for the database type
type DatabaseConfig = {
  type: string;
  host: string;
  username: string;
  password: string;
  port: number;
  synchronize: boolean;
};

// Helper function for get the base info to configure multiples databases
export const getBaseDatabaseConfig = (): DatabaseConfig => ({
  type: 'postgres',
  host: process.env.DB_HOST || '0.0.0.0',
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'root',
  port: parseInt(process.env.DB_PORT, 10),
  synchronize: Boolean(process.env.TYPEORM_SYNC),
});

// This configuracion can change depending on the database
type ConnectionConfig = {
  name: string;
  database: string;
  entities: string[];
  logging: string[];
  keepConnectionAlive: boolean;
};

// This type can be extended by the database configuracion
export type TypeOrmConfig = DatabaseConfig & ConnectionConfig;

// Helper function for get the base info to configure multiples databases
export function createDatabaseConnection(
  connectionConf: ConnectionConfig,
): TypeOrmConfig {
  return {
    ...getBaseDatabaseConfig(),
    name: connectionConf.name,
    database: connectionConf.database,
    entities: connectionConf.entities,
    logging: connectionConf.logging,
    keepConnectionAlive: connectionConf.keepConnectionAlive,
  };
}

// This configuracion is craeted to validate the env variables
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

// If you add a new database, you need to add a new configuracion here
export const databaseConfigs = [
  userDatabaseConf,
  artistDatabaseConf,
  customerDatabaseConf,
  followDatabaseConf,
  reactionDatabaseConf,
  postDatabaseConf,
  genreDatabaseConf,
  tagDatabaseConf,
  agendaDatabaseConf,
  locationDatabaseConf,
  customerFeedDatabaseConf,
  oasConfig,
];
