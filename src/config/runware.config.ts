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
}); 