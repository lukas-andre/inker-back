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
} from './schemas/agenda';
import { SendVerificationCodeJobSchema } from './schemas/codes';
import {
  QuotationAcceptedJobSchema,
  QuotationAppealedJobSchema,
  QuotationCanceledJobSchema,
  QuotationCreatedJobSchema,
  QuotationRejectedJobSchema,
  QuotationRepliedJobSchema,
} from './schemas/quotation';
import {
  NewOfferReceivedJobSchema,
  OfferAcceptedJobSchema,
  OfferRejectedJobSchema,
} from './schemas/quotationOffer.schema';
import { PenaltyAppliedNotificationV1JobSchema, PENALTY_APPLIED_NOTIFICATION_V1 } from './schemas/penaltyNotification.schema';

export const JobTypeSchemaRegistry = {
  EVENT_CREATED: AgendaEventCreatedJobSchema,
  EVENT_CANCELED: AgendaEventCanceledJobSchema,
  EVENT_REMINDER: AgendaEventReminderJobSchema,
  EVENT_UPDATED: AgendaEventUpdatedJobSchema,
  EVENT_STATUS_CHANGED: AgendaEventStatusChangedJobSchema,
  RSVP_ACCEPTED: RsvpAcceptedJobSchema,
  RSVP_DECLINED: RsvpDeclinedJobSchema,
  RSVP_UNSCHEDULABLE: RsvpUnschedulableJobSchema,
  QUOTATION_CREATED: QuotationCreatedJobSchema,
  QUOTATION_REPLIED: QuotationRepliedJobSchema,
  QUOTATION_ACCEPTED: QuotationAcceptedJobSchema,
  QUOTATION_REJECTED: QuotationRejectedJobSchema,
  QUOTATION_APPEALED: QuotationAppealedJobSchema,
  QUOTATION_CANCELED: QuotationCanceledJobSchema,
  NEW_OFFER_RECEIVED: NewOfferReceivedJobSchema,
  OFFER_ACCEPTED: OfferAcceptedJobSchema,
  OFFER_REJECTED: OfferRejectedJobSchema,
  ACCOUNT_VERIFICATION_CODE: SendVerificationCodeJobSchema,
  [PENALTY_APPLIED_NOTIFICATION_V1]: PenaltyAppliedNotificationV1JobSchema,
  NEW_EVENT_MESSAGE: NewEventMessageJobSchema,
};

// export jobtype keys
export type JobTypeKey = keyof typeof JobTypeSchemaRegistry;
