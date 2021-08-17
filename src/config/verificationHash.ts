import { registerAs } from '@nestjs/config';

export default registerAs('verificationHash', () => ({
  saltLength: 16,
}));
