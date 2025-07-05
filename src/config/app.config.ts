import { registerAs } from '@nestjs/config';
import Joi from 'joi';

type AppConfig = {
  port: number;
  host: string;
  hoursBeforeSessionStart: number;
  storageProvider: 's3' | 'cloudflare';
  environment: 'development' | 'staging' | 'production' | 'local';
};

export const appConfig = registerAs<AppConfig>('app', () => ({
  port: Number(process.env.PORT),
  host: process.env.HOST,
  hoursBeforeSessionStart: Number(process.env.HOURS_BEFORE_SESSION_START),
  storageProvider:
    (process.env.STORAGE_PROVIDER as 's3' | 'cloudflare') || 's3',
  environment: process.env.ENV as 'development' | 'staging' | 'production' | 'local',
}));

export const appConfigSchema = Joi.object({
  HOST: Joi.string().hostname().default('0.0.0.0'),
  PORT: Joi.number().default(3000),
  HOURS_BEFORE_SESSION_START: Joi.number().default(1),
  STORAGE_PROVIDER: Joi.string().valid('s3', 'cloudflare').default('s3'),
  ENV: Joi.string().valid('development', 'staging', 'production', 'local').default('local'),
});
