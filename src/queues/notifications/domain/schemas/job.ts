import { z } from 'zod';

import {
  AgendaEventCanceledJobSchema,
  AgendaEventCreatedJobSchema,
  AgendaEventReminderJobSchema,
  AgendaEventStatusChangedJobSchema,
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

import { SendVerificationCodeJobSchema } from './codes';
import { NewOfferReceivedJobSchema, OfferAcceptedJobSchema, OfferRejectedJobSchema } from './quotationOffer.schema';

export const JobSchema = z.union([
  // Agenda
  AgendaEventCreatedJobSchema,
  AgendaEventCanceledJobSchema,
  AgendaEventReminderJobSchema,
  AgendaEventUpdatedJobSchema,
  AgendaEventStatusChangedJobSchema,
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
  // Codes
  SendVerificationCodeJobSchema,
  // Quotation Offers
  NewOfferReceivedJobSchema,
  OfferAcceptedJobSchema,
  OfferRejectedJobSchema,
]);

export type JobType = z.infer<typeof JobSchema>;
