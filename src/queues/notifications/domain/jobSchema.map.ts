import {
  AgendaEventCanceledJobSchema,
  AgendaEventCreatedJobSchema,
  AgendaEventReminderJobSchema,
  AgendaEventUpdatedJobSchema,
  RsvpAcceptedJobSchema,
  RsvpDeclinedJobSchema,
  RsvpUnschedulableJobSchema,
} from './schemas/agenda';

export const JobTypeSchemaRegistry = {
  EVENT_CREATED: AgendaEventCreatedJobSchema,
  EVENT_CANCELED: AgendaEventCanceledJobSchema,
  EVENT_REMINDER: AgendaEventReminderJobSchema,
  EVENT_UPDATED: AgendaEventUpdatedJobSchema,
  RSVP_ACCEPTED: RsvpAcceptedJobSchema,
  RSVP_DECLINED: RsvpDeclinedJobSchema,
  RSVP_UNSCHEDULABLE: RsvpUnschedulableJobSchema,
};
