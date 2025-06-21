import { registerAs } from '@nestjs/config';
import Joi from 'joi';

type PlacesConfig = {
  apiKey: string;
  language: string;
  country: string;
  rateLimitPerMinute: number;
  rateLimitPerHour: number;
  cacheExpiry: number; // in seconds
};

export const PlacesConfig = registerAs<PlacesConfig>('places', () => ({
  apiKey: process.env.GOOGLE_PLACES_API_KEY,
  language: process.env.GOOGLE_PLACES_LANGUAGE || 'es-419',
  country: process.env.GOOGLE_PLACES_COUNTRY || 'cl',
  rateLimitPerMinute: parseInt(
    process.env.GOOGLE_PLACES_RATE_LIMIT_PER_MINUTE || '30',
    10,
  ),
  rateLimitPerHour: parseInt(
    process.env.GOOGLE_PLACES_RATE_LIMIT_PER_HOUR || '500',
    10,
  ),
  cacheExpiry: parseInt(process.env.GOOGLE_PLACES_CACHE_EXPIRY || '1800', 10), // 30 minutes default
}));

export const PlacesConfigSchema = Joi.object({
  GOOGLE_PLACES_API_KEY: Joi.string().required(),
  GOOGLE_PLACES_LANGUAGE: Joi.string().optional(),
  GOOGLE_PLACES_COUNTRY: Joi.string().optional(),
  GOOGLE_PLACES_RATE_LIMIT_PER_MINUTE: Joi.number().optional(),
  GOOGLE_PLACES_RATE_LIMIT_PER_HOUR: Joi.number().optional(),
  GOOGLE_PLACES_CACHE_EXPIRY: Joi.number().optional(),
});
