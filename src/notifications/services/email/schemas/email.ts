import { z } from 'zod';

export const MailIdSchema = z.enum([
  'EVENT_CREATED',
  'EVENT_CANCELED',
  'EVENT_REMINDER',
  'EVENT_UPDATED',
  'RSVP_ACCEPTED',
  'RSVP_DECLINED',
  'RSVP_UNSCHEDULABLE',
]);
export type MailIdType = z.infer<typeof MailIdSchema>;

export const BaseEmailSchema = z.object({
  mailId: MailIdSchema,
  to: z.string(),
});

export type BaseEmailType = z.infer<typeof BaseEmailSchema>;

const AgendaEventCreatedSchema = BaseEmailSchema.extend({
  mailId: z.literal(MailIdSchema.enum.EVENT_CREATED),
  customerName: z.string(),
  artistName: z.string(),
  eventName: z.string(),
  eventDate: z.date(),
  eventLocation: z.string(),
  googleMapsLink: z.string(),
});
export type AgendaEventCreatedType = z.infer<typeof AgendaEventCreatedSchema>;

const AgendaEventCanceledSchema = BaseEmailSchema.extend({
  mailId: z.literal(MailIdSchema.enum.EVENT_CANCELED),
  customerId: z.string(),
  eventName: z.string(),
  eventDate: z.date(),
});
export type AgendaEventCanceledType = z.infer<typeof AgendaEventCanceledSchema>;

const AgendaEventReminderSchema = BaseEmailSchema.extend({
  mailId: z.literal(MailIdSchema.enum.EVENT_REMINDER),
  customerId: z.string(),
  eventName: z.string(),
  eventDate: z.date(),
});
export type AgendaEventReminderType = z.infer<typeof AgendaEventReminderSchema>;

const AgendaEventUpdatedSchema = BaseEmailSchema.extend({
  mailId: z.literal(MailIdSchema.enum.EVENT_UPDATED),
  customerId: z.string(),
  eventName: z.string(),
  eventDate: z.date(),
});
export type AgendaEventUpdatedType = z.infer<typeof AgendaEventUpdatedSchema>;

const RsvpAcceptedSchema = BaseEmailSchema.extend({
  mailId: z.literal(MailIdSchema.enum.RSVP_ACCEPTED),
  customerId: z.string(),
  eventDate: z.date(),
  hostName: z.string(),
});
export type RsvpAcceptedType = z.infer<typeof RsvpAcceptedSchema>;

const RsvpDeclinedSchema = BaseEmailSchema.extend({
  mailId: z.literal(MailIdSchema.enum.RSVP_DECLINED),
  customerId: z.string(),
  eventDate: z.date(),
  hostName: z.string(),
});
export type RsvpDeclinedType = z.infer<typeof RsvpDeclinedSchema>;

const RsvpUnschedulableSchema = BaseEmailSchema.extend({
  mailId: z.literal(MailIdSchema.enum.RSVP_UNSCHEDULABLE),
  customerId: z.string(),
  eventDate: z.date(),
  hostName: z.string(),
});
export type RsvpUnschedulableType = z.infer<typeof RsvpUnschedulableSchema>;

export const EmailSchema = z.union([
  AgendaEventCreatedSchema,
  AgendaEventCanceledSchema,
  AgendaEventReminderSchema,
  AgendaEventUpdatedSchema,
  RsvpAcceptedSchema,
  RsvpDeclinedSchema,
  RsvpUnschedulableSchema,
]);

export type EmailType = z.infer<typeof EmailSchema>;

export {
  AgendaEventCreatedSchema,
  AgendaEventCanceledSchema,
  AgendaEventReminderSchema,
  AgendaEventUpdatedSchema,
  RsvpAcceptedSchema,
  RsvpDeclinedSchema,
  RsvpUnschedulableSchema,
};
