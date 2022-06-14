import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

type NotificationConfig = {
  sms: {
    maxTries: number;
  };
  email: {
    maxTries: number;
  };
};

type VerificationHashConfig = {
  saltLength: number;
  accountVerification: NotificationConfig;
  forgotPasswordVerification: NotificationConfig;
};

export const verificationHashConf = registerAs<VerificationHashConfig>(
  'verificationHash',
  () => ({
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
  }),
);

export const verificationHashConfigSchema = Joi.object({
  VERIFICATION_HASH_SALT_LEN: Joi.number().default(16),
  ACCOUNT_VERIFICATION_MAX_SMS_TRIES: Joi.number().default(4),
  FORGOT_PASSWORD_VERIFICATION_MAX_SMS_TRIES: Joi.number().default(4),
});
