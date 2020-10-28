import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  jwtIssuer: process.env.JWT_ISSUER,
  jwtSecretKey: process.env.JWT_SECRET_KEY,
  jwtExpiration: parseInt(process.env.JWT_EXPIRATION, 30),
  saltLength: 8,
}));
