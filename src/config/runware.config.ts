import { registerAs } from '@nestjs/config';
import Joi from 'joi';

type RunwareConfig = {
  apiKey: string;
  apiUrl: string;
  model: string;
  steps: number;
  width: number;
  height: number;
  includeCost: boolean;
  CFGScale: number;
  scheduler: string;
  taskType: string;
  retry: {
    maxRetries: number;
    initialDelayMs: number;
    maxDelayMs: number;
    backoffFactor: number;
  };
};

export const runwareConfig = registerAs<RunwareConfig>('runware', () => ({
  apiKey: process.env.RUNWARE_API_KEY,
  apiUrl: process.env.RUNWARE_API_URL,
  model: process.env.RUNWARE_MODEL,
  steps: parseInt(process.env.RUNWARE_STEPS, 10),
  width: parseInt(process.env.RUNWARE_WIDTH, 10),
  height: parseInt(process.env.RUNWARE_HEIGHT, 10),
  includeCost: process.env.RUNWARE_INCLUDE_COST === 'true',
  CFGScale: parseInt(process.env.RUNWARE_CFG_SCALE, 10),
  scheduler: process.env.RUNWARE_SCHEDULER,
  taskType: process.env.RUNWARE_TASK_TYPE,
  retry: {
    maxRetries: parseInt(process.env.RUNWARE_RETRY_MAX_RETRIES || '5', 10),
    initialDelayMs: parseInt(process.env.RUNWARE_RETRY_INITIAL_DELAY_MS || '500', 10),
    maxDelayMs: parseInt(process.env.RUNWARE_RETRY_MAX_DELAY_MS || '10000', 10),
    backoffFactor: parseFloat(process.env.RUNWARE_RETRY_BACKOFF_FACTOR || '2'),
  },
}));

export const runwareConfigSchema = Joi.object({
  RUNWARE_API_KEY: Joi.string().required(),
  RUNWARE_API_URL: Joi.string().required(),
  RUNWARE_MODEL: Joi.string().required(),
  RUNWARE_STEPS: Joi.number().required(),
  RUNWARE_WIDTH: Joi.number().required(),
  RUNWARE_HEIGHT: Joi.number().required(),
  RUNWARE_INCLUDE_COST: Joi.boolean().required(),
  RUNWARE_CFG_SCALE: Joi.number().required(),
  RUNWARE_SCHEDULER: Joi.string().required(),
  RUNWARE_TASK_TYPE: Joi.string().required(),
  RUNWARE_RETRY_MAX_RETRIES: Joi.number().default(5),
  RUNWARE_RETRY_INITIAL_DELAY_MS: Joi.number().default(500),
  RUNWARE_RETRY_MAX_DELAY_MS: Joi.number().default(10000),
  RUNWARE_RETRY_BACKOFF_FACTOR: Joi.number().default(2),
}); 