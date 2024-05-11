import path from 'path';

import {
  AgendaEventCanceledSchema,
  AgendaEventCreatedSchema,
  AgendaEventReminderSchema,
  AgendaEventUpdatedSchema,
  MailIdType,
  RsvpAcceptedSchema,
  RsvpDeclinedSchema,
  RsvpUnschedulableSchema,
} from '../schemas/email';

export const TemplateRegistry: Record<
  MailIdType,
  { schema: Zod.AnyZodObject; path: string; subject: string }
> = {
  EVENT_CREATED: {
    schema: AgendaEventCreatedSchema,
    path: path.join(__dirname, './agendaEventCreated.hbs'),
    subject: 'Event Created',
  },
  EVENT_CANCELED: {
    schema: AgendaEventCanceledSchema,
    path: 'agendaEventCanceled.hbs',
    subject: 'Event Canceled',
  },
  EVENT_REMINDER: {
    schema: AgendaEventReminderSchema,
    path: 'agendaEventReminder.hbs',
    subject: 'Event Reminder',
  },
  EVENT_UPDATED: {
    schema: AgendaEventUpdatedSchema,
    path: 'agendaEventUpdated.hbs',
    subject: 'Event Updated',
  },
  RSVP_ACCEPTED: {
    schema: RsvpAcceptedSchema,
    path: 'rsvpAccepted.hbs',
    subject: 'RSVP Accepted',
  },
  RSVP_DECLINED: {
    schema: RsvpDeclinedSchema,
    path: 'rsvpDeclined.hbs',
    subject: 'RSVP Declined',
  },
  RSVP_UNSCHEDULABLE: {
    schema: RsvpUnschedulableSchema,
    path: 'rsvpUnschedulable.hbs',
    subject: 'RSVP Unschedulable',
  },
};
