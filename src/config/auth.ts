import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  jwtIssuer: process.env.JWT_ISSUER,
  jwtSecretKey: process.env.JWT_SECRET_KEY,
  jwtExpiration: process.env.JWT_EXPIRATION
    ? process.env.JWT_EXPIRATION
    : '30d',
  saltLength: 8,
}));
