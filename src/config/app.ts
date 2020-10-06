import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: process.env.PORT,
  url: process.env.INKER_BACK_URL,
  rateLimitWindow: 60000,
  rateLimitMax: 400,
  defaultQueryLimit: 50,
}));
