import { z } from 'zod';
import { UserType } from '../../../../users/domain/enums/userType.enum';
import { NotificationTypeEmail, NotificationTypeEmailAndPush, NotificationTypePush } from './notification';
export const EVENT_STATUS_CHANGED = 'EVENT_STATUS_CHANGED' as const;
export const EVENT_REMINDER = 'EVENT_REMINDER' as const;
export const EVENT_CONFIRMED_BY_CUSTOMER = 'EVENT_CONFIRMED_BY_CUSTOMER' as const;
export const EVENT_REJECTED_BY_CUSTOMER = 'EVENT_REJECTED_BY_CUSTOMER' as const;
export const EVENT_RESCHEDULED_BY_ARTIST = 'EVENT_RESCHEDULED_BY_ARTIST' as const;
export const EVENT_RESCHEDULED_BY_CUSTOMER = 'EVENT_RESCHEDULED_BY_CUSTOMER' as const;
export const RSVP_ACCEPTED = 'RSVP_ACCEPTED' as const;
export const RSVP_DECLINED = 'RSVP_DECLINED' as const;
export const RSVP_UNSCHEDULABLE = 'RSVP_UNSCHEDULABLE' as const;
export const NewEventMessageJobId = 'NEW_EVENT_MESSAGE' as const;

export const AgendaJobIdSchema = z.enum([
  'EVENT_CREATED',
  'EVENT_CANCELED',
  'EVENT_REMINDER',
  'EVENT_UPDATED',
  'EVENT_STATUS_CHANGED',
  'RSVP_ACCEPTED',
  'RSVP_DECLINED',
  'RSVP_UNSCHEDULABLE',
  'EVENT_RESCHEDULED_BY_ARTIST',
  'EVENT_RESCHEDULED_BY_CUSTOMER',
  NewEventMessageJobId,
]);
export type AgendaJobIdType = z.infer<typeof AgendaJobIdSchema>;

const AgendaJobSchema = z.object({
  jobId: AgendaJobIdSchema,
  notificationTypeId: z.enum([NotificationTypePush, NotificationTypeEmail, NotificationTypeEmailAndPush]),
  metadata: z.object({
    customerId: z.string(),
    eventId: z.string(),
    artistId: z.string(),
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
  metadata: z.object({
    customerId: z.string(),
    eventId: z.string(),
    artistId: z.string(),
    reminderType: z.string().optional(),
  }),
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
    customerId: z.string(),
    eventId: z.string(),
    artistId: z.string(),
    status: z.string(),
    message: z.string(),
  }),
});
export type AgendaEventStatusChangedJobType = z.infer<
  typeof AgendaEventStatusChangedJobSchema
>;

const EventRescheduledByArtistJobSchema = AgendaJobSchema.extend({
  jobId: z.literal(EVENT_RESCHEDULED_BY_ARTIST),
});
export type EventRescheduledByArtistJob = z.infer<typeof EventRescheduledByArtistJobSchema>;

const EventRescheduledByCustomerJobSchema = AgendaJobSchema.extend({
  jobId: z.literal(EVENT_RESCHEDULED_BY_CUSTOMER),
});
export type EventRescheduledByCustomerJob = z.infer<typeof EventRescheduledByCustomerJobSchema>;

 const NewEventMessageJobSchema = z.object({
  jobId: z.literal(NewEventMessageJobId),
  notificationTypeId: z.literal(NotificationTypePush),
  metadata: z.object({
    eventId: z.string().uuid(),
    agendaId: z.string().uuid(),
    senderId: z.string(),
    senderUserType: z.nativeEnum(UserType),
    receiverUserTypeId: z.string(),
    messageSnippet: z.string().max(100).describe("First 100 characters of the message"),
    senderName: z.string().optional().describe("Name of the message sender, if available"),
  }),
});
export type NewEventMessageJob = z.infer<typeof NewEventMessageJobSchema>;

export {
  AgendaEventCreatedJobSchema,
  AgendaEventCanceledJobSchema,
  AgendaEventReminderJobSchema,
  AgendaEventUpdatedJobSchema,
  AgendaEventStatusChangedJobSchema,
  RsvpAcceptedJobSchema,
  RsvpDeclinedJobSchema,
  RsvpUnschedulableJobSchema,
  EventRescheduledByArtistJobSchema,
  EventRescheduledByCustomerJobSchema,
  NewEventMessageJobSchema,
};
