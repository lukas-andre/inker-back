import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

type OASConfig = {
  enabled: boolean;
  path: string;
};

export const oasConfig = registerAs<OASConfig>('oas', () => ({
  enabled: true,
  path: process.env.OAS_PATH,
}));

export const oasConfigSchema = Joi.object({
  OAS_PATH: Joi.string().default('oas'),
});
