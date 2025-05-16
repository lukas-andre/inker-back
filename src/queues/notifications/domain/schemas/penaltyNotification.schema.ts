import { z } from 'zod';

export const PENALTY_APPLIED_NOTIFICATION_V1 =
  'penalty-applied-notification-v1';

export const PenaltyAppliedNotificationV1JobSchema = z.object({
  jobId: z.literal(PENALTY_APPLIED_NOTIFICATION_V1),
  penaltyId: z.string().uuid(),
  userId: z.string().uuid(),
  penaltyAmount: z.number().positive(),
  currency: z.string().length(3), // ISO 4217 currency code
  reason: z.string(),
  eventId: z.string().uuid().optional(),
  cancellationReason: z.string().optional(),
  recipientEmail: z.string().email().optional(), // If sending email directly
  recipientLocale: z.string().optional().default('en'), // For i18n
});

export type PenaltyAppliedNotificationV1Job = z.infer<
  typeof PenaltyAppliedNotificationV1JobSchema
>; 