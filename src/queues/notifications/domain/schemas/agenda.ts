import { z } from 'zod';

import { NotificationTypeSchema } from './notification';

export const AgendaJobIdSchema = z.enum([
  'EVENT_CREATED',
  'EVENT_CANCELED',
  'EVENT_REMINDER',
  'EVENT_UPDATED',
  'EVENT_STATUS_CHANGED',
  'RSVP_ACCEPTED',
  'RSVP_DECLINED',
  'RSVP_UNSCHEDULABLE',
]);
export type AgendaJobIdType = z.infer<typeof AgendaJobIdSchema>;

const AgendaJobSchema = z.object({
  jobId: AgendaJobIdSchema,
  notificationTypeId: NotificationTypeSchema,
  metadata: z.object({
    customerId: z.number(),
    eventId: z.number(),
    artistId: z.number(),
  }),
});

export type AgendaJobType = z.infer<typeof AgendaJobSchema>;

const AgendaEventCreatedJobSchema = AgendaJobSchema.extend({
  jobId: z.literal(AgendaJobIdSchema.enum.EVENT_CREATED),
});
export type AgendaEventcreatedJobType = z.infer<
  typeof AgendaEventCreatedJobSchema
>;

const AgendaEventCanceledJobSchema = AgendaJobSchema.extend({
  jobId: z.literal(AgendaJobIdSchema.enum.EVENT_CANCELED),
});
export type AgendaEventCanceledJobType = z.infer<
  typeof AgendaEventCanceledJobSchema
>;

const AgendaEventReminderJobSchema = AgendaJobSchema.extend({
  jobId: z.literal(AgendaJobIdSchema.enum.EVENT_REMINDER),
});
export type AgendaEventReminderJobType = z.infer<
  typeof AgendaEventReminderJobSchema
>;

const AgendaEventUpdatedJobSchema = AgendaJobSchema.extend({
  jobId: z.literal(AgendaJobIdSchema.enum.EVENT_UPDATED),
});
export type AgendaEventUpdatedJobType = z.infer<
  typeof AgendaEventUpdatedJobSchema
>;

const RsvpAcceptedJobSchema = AgendaJobSchema.extend({
  jobId: z.literal(AgendaJobIdSchema.enum.RSVP_ACCEPTED),
});
export type RsvpAcceptedJobType = z.infer<typeof RsvpAcceptedJobSchema>;

const RsvpDeclinedJobSchema = AgendaJobSchema.extend({
  jobId: z.literal(AgendaJobIdSchema.enum.RSVP_DECLINED),
});
export type RsvpDeclinedJobType = z.infer<typeof RsvpDeclinedJobSchema>;

const RsvpUnschedulableJobSchema = AgendaJobSchema.extend({
  jobId: z.literal(AgendaJobIdSchema.enum.RSVP_UNSCHEDULABLE),
});
export type RsvpUnschedulableJobType = z.infer<
  typeof RsvpUnschedulableJobSchema
>;

export type RsvpJobType =
  | RsvpAcceptedJobType
  | RsvpDeclinedJobType
  | RsvpUnschedulableJobType;

const AgendaEventStatusChangedJobSchema = AgendaJobSchema.extend({
  jobId: z.literal(AgendaJobIdSchema.enum.EVENT_STATUS_CHANGED),
  metadata: z.object({
    customerId: z.number(),
    eventId: z.number(),
    artistId: z.number(),
    status: z.string(),
    message: z.string(),
  }),
});
export type AgendaEventStatusChangedJobType = z.infer<
  typeof AgendaEventStatusChangedJobSchema
>;

export {
  AgendaEventCreatedJobSchema,
  AgendaEventCanceledJobSchema,
  AgendaEventReminderJobSchema,
  AgendaEventUpdatedJobSchema,
  AgendaEventStatusChangedJobSchema,
  RsvpAcceptedJobSchema,
  RsvpDeclinedJobSchema,
  RsvpUnschedulableJobSchema,
};
