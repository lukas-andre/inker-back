import { z } from 'zod';

export const NotificationTypeEmail = 'EMAIL';
export const NotificationTypePush = 'PUSH';

export const NotificationTypeSchema = z.enum([
  NotificationTypeEmail,
  NotificationTypePush,
]);

export const NotificationSchema = z.object({
  type: NotificationTypeSchema,
});

export type NotificationType = z.infer<typeof NotificationTypeSchema>;
