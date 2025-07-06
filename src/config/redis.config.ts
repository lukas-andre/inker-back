import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export const redisConfig = registerAs('redis', () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  retryAttempts: parseInt(process.env.REDIS_RETRY_ATTEMPTS || '10', 10),
  retryDelay: parseInt(process.env.REDIS_RETRY_DELAY || '3000', 10),
  connectTimeout: parseInt(process.env.REDIS_CONNECT_TIMEOUT || '10000', 10),
}));

export const redisConfigSchema = Joi.object({
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().port().default(6379),
  REDIS_PASSWORD: Joi.string().optional().allow(''),
  REDIS_RETRY_ATTEMPTS: Joi.number().integer().min(0).default(10),
  REDIS_RETRY_DELAY: Joi.number().integer().min(0).default(3000),
  REDIS_CONNECT_TIMEOUT: Joi.number().integer().min(0).default(10000),
});