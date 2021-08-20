import { registerAs } from '@nestjs/config';

export default registerAs('verificationHash', () => ({
  saltLength: Number(process.env.VERIFICATION_HASH_SALT_LEN),
  maxSMSTries: Number(process.env.MAX_SMS_TRIES),
}));
