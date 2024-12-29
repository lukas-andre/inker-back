import { registerAs } from '@nestjs/config';
import Joi from 'joi';

type SendGridConfig = {
  apiKey: string;
};

export const sendGridConfig = registerAs<SendGridConfig>('sendGrid', () => ({
  apiKey: process.env.SENDGRID_API_KEY,
}));

export const sendGridSchema = Joi.object({
  SENDGRID_API_KEY: Joi.string().required(),
});
