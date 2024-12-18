import { z } from 'zod';
import { NotificationTypeSchema } from './notification';

export const SendVerificationCodeJobSchema = z.object({
  jobId: z.literal('ACCOUNT_VERIFICATION_CODE'),
  notificationTypeId: NotificationTypeSchema,
  metadata: z.object({
    email: z.string(),
    code: z.string(),
    expirationTime: z.number(),
  }),
});

export type SendVerificationCodeJobType = z.infer<
  typeof SendVerificationCodeJobSchema
>;
