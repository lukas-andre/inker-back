import { registerAs } from '@nestjs/config';
import Joi from 'joi';

type AppConfig = {
  port: number;
  host: string;
};

export const appConfig = registerAs<AppConfig>('app', () => ({
  port: Number(process.env.PORT),
  host: process.env.HOST,
}));

export const appConfigSchema = Joi.object({
  HOST: Joi.string().hostname().default('0.0.0.0'),
  PORT: Joi.number().default(3000),
});
