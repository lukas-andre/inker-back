import {
  AgendaEventCanceledJobSchema,
  AgendaEventCreatedJobSchema,
  AgendaEventReminderJobSchema,
  AgendaEventUpdatedJobSchema,
  RsvpAcceptedJobSchema,
  RsvpDeclinedJobSchema,
  RsvpUnschedulableJobSchema,
} from './schemas/agenda';
import {
  QuotationAcceptedJobSchema,
  QuotationAppealedJobSchema,
  QuotationCanceledJobSchema,
  QuotationCreatedJobSchema,
  QuotationRejectedJobSchema,
  QuotationRepliedJobSchema,
} from './schemas/quotation';

export const JobTypeSchemaRegistry = {
  EVENT_CREATED: AgendaEventCreatedJobSchema,
  EVENT_CANCELED: AgendaEventCanceledJobSchema,
  EVENT_REMINDER: AgendaEventReminderJobSchema,
  EVENT_UPDATED: AgendaEventUpdatedJobSchema,
  RSVP_ACCEPTED: RsvpAcceptedJobSchema,
  RSVP_DECLINED: RsvpDeclinedJobSchema,
  RSVP_UNSCHEDULABLE: RsvpUnschedulableJobSchema,
  QUOTATION_CREATED: QuotationCreatedJobSchema,
  QUOTATION_REPLIED: QuotationRepliedJobSchema,
  QUOTATION_ACCEPTED: QuotationAcceptedJobSchema,
  QUOTATION_REJECTED: QuotationRejectedJobSchema,
  QUOTATION_APPEALED: QuotationAppealedJobSchema,
  QUOTATION_CANCELED: QuotationCanceledJobSchema,
};

// export jobtype keys
export type JobTypeKey = keyof typeof JobTypeSchemaRegistry;
