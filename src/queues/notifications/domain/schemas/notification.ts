import { z } from 'zod';

export const NotificationTypeEmail = 'EMAIL';
export const NotificationTypePush = 'PUSH';
export const NotificationTypeEmailAndPush = 'EMAIL_AND_PUSH';

export const NotificationTypeSchema = z.enum([
  NotificationTypeEmail,
  NotificationTypePush,
  NotificationTypeEmailAndPush,
]);

export const NotificationSchema = z.object({
  type: NotificationTypeSchema,
});

export type NotificationType = z.infer<typeof NotificationTypeSchema>;
