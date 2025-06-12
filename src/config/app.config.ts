import { registerAs } from '@nestjs/config';
import Joi from 'joi';

type AppConfig = {
  port: number;
  host: string;
  hoursBeforeSessionStart: number;
};

export const appConfig = registerAs<AppConfig>('app', () => ({
  port: Number(process.env.PORT),
  host: process.env.HOST,
  hoursBeforeSessionStart: Number(process.env.HOURS_BEFORE_SESSION_START),
}));

export const appConfigSchema = Joi.object({
  HOST: Joi.string().hostname().default('0.0.0.0'),
  PORT: Joi.number().default(3000),
  HOURS_BEFORE_SESSION_START: Joi.number().default(1),
});
