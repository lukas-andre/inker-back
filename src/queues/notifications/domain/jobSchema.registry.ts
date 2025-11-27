import {
  AgendaEventCanceledJobSchema,
  AgendaEventCreatedJobSchema,
  AgendaEventReminderJobSchema,
  AgendaEventStatusChangedJobSchema,
  AgendaEventUpdatedJobSchema,
  AppointmentReminderJobSchema,
  ConfirmationReminderJobSchema,
  ConsentReminderJobSchema,
  EventAutoCanceledJobSchema,
  MonthlyReportJobSchema,
  NewEventMessageJobSchema,
  PhotoUploadReminderJobSchema,
  ReviewReminderJobSchema,
  RsvpAcceptedJobSchema,
  RsvpDeclinedJobSchema,
  RsvpUnschedulableJobSchema,
} from './schemas/agenda';
import { SendVerificationCodeJobSchema } from './schemas/codes';
import {
  PENALTY_APPLIED_NOTIFICATION_V1,
  PenaltyAppliedNotificationV1JobSchema,
} from './schemas/penaltyNotification.schema';
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
import {
  LOW_TOKEN_BALANCE,
  TOKEN_PURCHASE_CONFIRMATION,
  TOKEN_GRANT_NOTIFICATION,
  LowTokenBalanceJobSchema,
  TokenPurchaseConfirmationJobSchema,
  TokenGrantNotificationJobSchema,
} from './schemas/tokens';

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
  APPOINTMENT_REMINDER: AppointmentReminderJobSchema,
  CONSENT_REMINDER: ConsentReminderJobSchema,
  CONFIRMATION_REMINDER: ConfirmationReminderJobSchema,
  EVENT_AUTO_CANCELED: EventAutoCanceledJobSchema,
  REVIEW_REMINDER: ReviewReminderJobSchema,
  PHOTO_UPLOAD_REMINDER: PhotoUploadReminderJobSchema,
  MONTHLY_REPORT: MonthlyReportJobSchema,
  // Token notifications
  [LOW_TOKEN_BALANCE]: LowTokenBalanceJobSchema,
  [TOKEN_PURCHASE_CONFIRMATION]: TokenPurchaseConfirmationJobSchema,
  [TOKEN_GRANT_NOTIFICATION]: TokenGrantNotificationJobSchema,
};

// export jobtype keys
export type JobTypeKey = keyof typeof JobTypeSchemaRegistry;
