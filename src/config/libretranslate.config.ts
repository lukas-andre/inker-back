import { registerAs } from '@nestjs/config';

export default registerAs('libretranslate', () => ({
  url: process.env.LIBRETRANSLATE_URL || 'http://localhost:5000',
  apiKey: process.env.LIBRETRANSLATE_API_KEY || '',
})); 