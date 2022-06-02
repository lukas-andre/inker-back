import { registerAs } from '@nestjs/config';

export default registerAs('verificationHash', () => ({
  saltLength: Number(process.env.VERIFICATION_HASH_SALT_LEN) || 16,
  accountVerification: {
    sms: {
      maxTries: Number(process.env.ACCOUNT_VERIFICATION_MAX_SMS_TRIES) || 4,
    },
    email: {
      maxTries: Number(process.env.ACCOUNT_VERIFICATION_MAX_SMS_TRIES) || 4,
    },
  },
  forgotPasswordVerification: {
    sms: {
      maxTries: Number(
        process.env.FORGOT_PASSWORD_VERIFICATION_MAX_SMS_TRIES || 4,
      ),
    },
    email: {
      maxTries: Number(
        process.env.FORGOT_PASSWORD_VERIFICATION_MAX_SMS_TRIES || 4,
      ),
    },
  },
}));
