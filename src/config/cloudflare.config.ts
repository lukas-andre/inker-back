import { registerAs } from '@nestjs/config';
import Joi from 'joi';

type CloudflareConfig = {
  accountId: string;
  apiToken: string;
  imagesDeliveryUrl: string;
};

export const cloudflareConfig = registerAs<CloudflareConfig>('cloudflare', () => ({
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
  apiToken: process.env.CLOUDFLARE_API_TOKEN,
  imagesDeliveryUrl: process.env.CLOUDFLARE_IMAGES_DELIVERY_URL,
}));

export const cloudflareConfigSchema = Joi.object({
  CLOUDFLARE_ACCOUNT_ID: Joi.string().required(),
  CLOUDFLARE_API_TOKEN: Joi.string().required(),
  CLOUDFLARE_IMAGES_DELIVERY_URL: Joi.string().uri().required(),
});