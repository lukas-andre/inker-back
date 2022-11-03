import { registerAs } from '@nestjs/config';
import Joi from 'joi';

type AuthConfig = {
  jwtIssuer: string;
  jwtSecretKey: string;
  jwtExpiration: string;
  saltLength: number;
};

export const authConfig = registerAs<AuthConfig>('auth', () => ({
  jwtIssuer: process.env.JWT_ISSUER,
  jwtSecretKey: process.env.JWT_SECRET_KEY,
  jwtExpiration: process.env.JWT_EXPIRATION ? process.env.JWT_EXPIRATION : '1d',
  saltLength: 8,
}));

export const authConfigSchema = Joi.object({
  JWT_ISSUER: Joi.string().required(),
  JWT_SECRET_KEY: Joi.string().required(),
  JWT_EXPIRATION: Joi.string().default('1d'),
});
