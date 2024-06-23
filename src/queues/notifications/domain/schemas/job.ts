import { z } from 'zod';

import {
  AgendaEventCanceledJobSchema,
  AgendaEventCreatedJobSchema,
  AgendaEventReminderJobSchema,
  AgendaEventUpdatedJobSchema,
  RsvpAcceptedJobSchema,
  RsvpDeclinedJobSchema,
  RsvpUnschedulableJobSchema,
} from './agenda';
import {
  QuotationAcceptedJobSchema,
  QuotationAppealedJobSchema,
  QuotationCanceledJobSchema,
  QuotationCreatedJobSchema,
  QuotationRejectedJobSchema,
  QuotationRepliedJobSchema,
} from './quotation';

export const JobSchema = z.union([
  // Agenda
  AgendaEventCreatedJobSchema,
  AgendaEventCanceledJobSchema,
  AgendaEventReminderJobSchema,
  AgendaEventUpdatedJobSchema,
  // Rsvp
  RsvpAcceptedJobSchema,
  RsvpDeclinedJobSchema,
  RsvpUnschedulableJobSchema,
  // Quotation
  QuotationAcceptedJobSchema,
  QuotationAppealedJobSchema,
  QuotationCanceledJobSchema,
  QuotationCreatedJobSchema,
  QuotationRejectedJobSchema,
  QuotationRepliedJobSchema,
]);

export type JobType = z.infer<typeof JobSchema>;
