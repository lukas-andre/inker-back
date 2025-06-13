import { z } from 'zod';

import {
  AgendaEventCanceledJobSchema,
  AgendaEventCreatedJobSchema,
  AgendaEventReminderJobSchema,
  AgendaEventStatusChangedJobSchema,
  AgendaEventUpdatedJobSchema,
  NewEventMessageJobSchema,
  RsvpAcceptedJobSchema,
  RsvpDeclinedJobSchema,
  RsvpUnschedulableJobSchema,
  // New scheduled notification schemas
  AppointmentReminderJobSchema,
  ConsentReminderJobSchema,
  ConfirmationReminderJobSchema,
  EventAutoCanceledJobSchema,
  ReviewReminderJobSchema,
  PhotoUploadReminderJobSchema,
  MonthlyReportJobSchema,
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
import { PenaltyAppliedNotificationV1JobSchema } from './penaltyNotification.schema';

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
  // Penalty Notifications
  PenaltyAppliedNotificationV1JobSchema,
  // New Event Message Notification
  NewEventMessageJobSchema,
  // New scheduled notifications
  AppointmentReminderJobSchema,
  ConsentReminderJobSchema,
  ConfirmationReminderJobSchema,
  EventAutoCanceledJobSchema,
  ReviewReminderJobSchema,
  PhotoUploadReminderJobSchema,
  MonthlyReportJobSchema,
]);

export type JobType = z.infer<typeof JobSchema>;
