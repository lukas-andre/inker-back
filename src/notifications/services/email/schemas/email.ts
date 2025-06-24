import { z } from 'zod';

export const MailIdSchema = z.enum([
  'EVENT_CREATED',
  'EVENT_CANCELED',
  'EVENT_REMINDER',
  'EVENT_UPDATED',
  'EVENT_STATUS_CHANGED',
  'RSVP_ACCEPTED',
  'RSVP_DECLINED',
  'RSVP_UNSCHEDULABLE',
  'QUOTATION_CREATED',
  'QUOTATION_REPLIED',
  'QUOTATION_ACCEPTED',
  'QUOTATION_REJECTED',
  'QUOTATION_APPEALED',
  'QUOTATION_CANCELED',
  'ACCOUNT_VERIFICATION_CODE',
  'APPOINTMENT_REMINDER',
  'CONSENT_REMINDER',
  'CONFIRMATION_REMINDER',
  'EVENT_AUTO_CANCELED',
  'REVIEW_REMINDER',
  'MONTHLY_REPORT',
  // Token notifications
  'LOW_TOKEN_BALANCE',
  'TOKEN_PURCHASE_CONFIRMATION',
  'TOKEN_GRANT_NOTIFICATION',
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
  customerName: z.string(),
  artistName: z.string(),
  eventName: z.string(),
  eventDate: z.date(),
  eventLocation: z.string(),
  googleMapsLink: z.string(),
  cancelationReason: z.string(),
});
export type AgendaEventCanceledType = z.infer<typeof AgendaEventCanceledSchema>;

const AgendaEventReminderSchema = BaseEmailSchema.extend({
  mailId: z.literal(MailIdSchema.enum.EVENT_REMINDER),
  customerName: z.string(),
  artistName: z.string(),
  eventName: z.string(),
  eventDate: z.date(),
  eventLocation: z.string(),
  googleMapsLink: z.string(),
  timeDescription: z.string().optional(),
});
export type AgendaEventReminderType = z.infer<typeof AgendaEventReminderSchema>;

const AgendaEventUpdatedSchema = BaseEmailSchema.extend({
  mailId: z.literal(MailIdSchema.enum.EVENT_UPDATED),
  customerName: z.string(),
  artistName: z.string(),
  eventName: z.string(),
  eventDate: z.date(),
  eventOldDate: z.date().optional(),
  eventLocation: z.string(),
  googleMapsLink: z.string(),
});
export type AgendaEventUpdatedType = z.infer<typeof AgendaEventUpdatedSchema>;

const RsvpAcceptedSchema = BaseEmailSchema.extend({
  mailId: z.literal(MailIdSchema.enum.RSVP_ACCEPTED),
  customerName: z.string(),
  artistName: z.string(),
  eventName: z.string(),
  eventDate: z.date(),
  eventLocation: z.string(),
  googleMapsLink: z.string(),
});
export type RsvpAcceptedType = z.infer<typeof RsvpAcceptedSchema>;

const RsvpDeclinedSchema = BaseEmailSchema.extend({
  mailId: z.literal(MailIdSchema.enum.RSVP_DECLINED),
  customerName: z.string(),
  artistName: z.string(),
  eventName: z.string(),
  eventDate: z.date(),
  eventLocation: z.string(),
  googleMapsLink: z.string(),
});
export type RsvpDeclinedType = z.infer<typeof RsvpDeclinedSchema>;

const RsvpUnschedulableSchema = BaseEmailSchema.extend({
  mailId: z.literal(MailIdSchema.enum.RSVP_UNSCHEDULABLE),
  customerName: z.string(),
  artistName: z.string(),
  eventDate: z.date(),
});
export type RsvpUnschedulableType = z.infer<typeof RsvpUnschedulableSchema>;

const QuotationCreatedSchema = BaseEmailSchema.extend({
  mailId: z.literal(MailIdSchema.enum.QUOTATION_CREATED),
  customerName: z.string(),
  artistName: z.string(),
  description: z.string(),
  referenceImages: z.array(z.string()).optional(),
});
export type QuotationCreatedType = z.infer<typeof QuotationCreatedSchema>;

const QuotationRepliedSchema = BaseEmailSchema.extend({
  mailId: z.literal(MailIdSchema.enum.QUOTATION_REPLIED),
  customerName: z.string(),
  artistName: z.string(),
  estimatedCost: z.string(),
  appointmentDate: z.date().optional(),
  appointmentDuration: z.number().optional(),
});
export type QuotationRepliedType = z.infer<typeof QuotationRepliedSchema>;

const QuotationAcceptedSchema = BaseEmailSchema.extend({
  mailId: z.literal(MailIdSchema.enum.QUOTATION_ACCEPTED),
  customerName: z.string(),
  artistName: z.string(),
  estimatedCost: z.string(),
  appointmentDate: z.date().optional(),
  appointmentDuration: z.number().optional(),
});
export type QuotationAcceptedType = z.infer<typeof QuotationAcceptedSchema>;

const QuotationRejectedSchema = BaseEmailSchema.extend({
  mailId: z.literal(MailIdSchema.enum.QUOTATION_REJECTED),
  customerName: z.string(),
  artistName: z.string(),
  rejectionReason: z.string(),
});
export type QuotationRejectedType = z.infer<typeof QuotationRejectedSchema>;

const QuotationAppealedSchema = BaseEmailSchema.extend({
  mailId: z.literal(MailIdSchema.enum.QUOTATION_APPEALED),
  customerName: z.string(),
  artistName: z.string(),
  appealReason: z.string(),
});
export type QuotationAppealedType = z.infer<typeof QuotationAppealedSchema>;

const QuotationCanceledSchema = BaseEmailSchema.extend({
  mailId: z.literal(MailIdSchema.enum.QUOTATION_CANCELED),
  customerName: z.string(),
  artistName: z.string(),
  cancelMessage: z.string(),
  canceledBy: z.enum(['artist', 'customer', 'system']),
});

export type QuotationCanceledType = z.infer<typeof QuotationCanceledSchema>;

const AccountVerificationCodeSchema = BaseEmailSchema.extend({
  mailId: z.literal(MailIdSchema.enum.ACCOUNT_VERIFICATION_CODE),
  verificationCode: z.string(),
  expirationTime: z.number(),
});
export type AccountVerificationCodeType = z.infer<
  typeof AccountVerificationCodeSchema
>;

const AgendaEventStatusChangedSchema = BaseEmailSchema.extend({
  mailId: z.literal(MailIdSchema.enum.EVENT_STATUS_CHANGED),
  customerName: z.string(),
  artistName: z.string(),
  eventName: z.string(),
  eventDate: z.date(),
  eventStatus: z.string(),
});
export type AgendaEventStatusChangedType = z.infer<
  typeof AgendaEventStatusChangedSchema
>;

const AppointmentReminderEmailSchema = BaseEmailSchema.extend({
  mailId: z.literal(MailIdSchema.enum.APPOINTMENT_REMINDER),
  customerName: z.string(),
  artistName: z.string(),
  eventName: z.string(),
  eventDate: z.date(),
  eventLocation: z.string(),
  googleMapsLink: z.string(),
  reminderType: z.string(),
  hoursUntilAppointment: z.number(),
});
export type AppointmentReminderEmailType = z.infer<
  typeof AppointmentReminderEmailSchema
>;

const ConsentReminderEmailSchema = BaseEmailSchema.extend({
  mailId: z.literal(MailIdSchema.enum.CONSENT_REMINDER),
  customerName: z.string(),
  artistName: z.string(),
  eventName: z.string(),
  eventDate: z.date(),
  eventLocation: z.string(),
  reminderType: z.string(),
  hoursUntilAppointment: z.number(),
  consentUrl: z.string(),
});
export type ConsentReminderEmailType = z.infer<
  typeof ConsentReminderEmailSchema
>;

const ConfirmationReminderEmailSchema = BaseEmailSchema.extend({
  mailId: z.literal(MailIdSchema.enum.CONFIRMATION_REMINDER),
  customerName: z.string(),
  artistName: z.string(),
  eventName: z.string(),
  eventDate: z.date(),
  hoursRemaining: z.number(),
  confirmationUrl: z.string(),
});
export type ConfirmationReminderEmailType = z.infer<
  typeof ConfirmationReminderEmailSchema
>;

const EventAutoCanceledEmailSchema = BaseEmailSchema.extend({
  mailId: z.literal(MailIdSchema.enum.EVENT_AUTO_CANCELED),
  customerName: z.string(),
  artistName: z.string(),
  eventName: z.string(),
  eventDate: z.date(),
  reason: z.string(),
});
export type EventAutoCanceledEmailType = z.infer<
  typeof EventAutoCanceledEmailSchema
>;

const ReviewReminderEmailSchema = BaseEmailSchema.extend({
  mailId: z.literal(MailIdSchema.enum.REVIEW_REMINDER),
  customerName: z.string(),
  artistName: z.string(),
  eventName: z.string(),
  completedDate: z.date(),
  reminderType: z.string(),
  reviewUrl: z.string(),
});
export type ReviewReminderEmailType = z.infer<typeof ReviewReminderEmailSchema>;

const MonthlyReportEmailSchema = BaseEmailSchema.extend({
  mailId: z.literal(MailIdSchema.enum.MONTHLY_REPORT),
  artistName: z.string(),
  reportMonth: z.string(),
  appointments: z.object({
    completedCount: z.number(),
    canceledCount: z.number(),
    rescheduledCount: z.number(),
    totalCount: z.number(),
    uniqueCustomers: z.number(),
  }),
  reviews: z.object({
    totalReviews: z.number(),
    averageRating: z.number(),
    positiveReviews: z.number(),
    negativeReviews: z.number(),
  }),
  quotations: z.object({
    total: z.number(),
    accepted: z.number(),
    rejected: z.number(),
    totalRevenue: z.number(),
  }),
  performance: z.object({
    conversionRate: z.string(),
    completionRate: z.string(),
    customerSatisfaction: z.string(),
  }),
});
export type MonthlyReportEmailType = z.infer<typeof MonthlyReportEmailSchema>;
// Token notification email schemas
const LowTokenBalanceEmailSchema = BaseEmailSchema.extend({
  mailId: z.literal(MailIdSchema.enum.LOW_TOKEN_BALANCE),
  userName: z.string(),
  currentBalance: z.number(),
  threshold: z.number(),
});
export type LowTokenBalanceEmailType = z.infer<typeof LowTokenBalanceEmailSchema>;

const TokenPurchaseConfirmationEmailSchema = BaseEmailSchema.extend({
  mailId: z.literal(MailIdSchema.enum.TOKEN_PURCHASE_CONFIRMATION),
  userName: z.string(),
  transactionId: z.string(),
  packageName: z.string(),
  tokensAmount: z.number(),
  price: z.string(), // Formatted price string
  newBalance: z.number(),
  paymentMethod: z.string(),
  purchaseDate: z.date(),
});
export type TokenPurchaseConfirmationEmailType = z.infer<typeof TokenPurchaseConfirmationEmailSchema>;

const TokenGrantNotificationEmailSchema = BaseEmailSchema.extend({
  mailId: z.literal(MailIdSchema.enum.TOKEN_GRANT_NOTIFICATION),
  userName: z.string(),
  tokensGranted: z.number(),
  reason: z.string(),
  newBalance: z.number(),
  grantDate: z.date(),
});
export type TokenGrantNotificationEmailType = z.infer<typeof TokenGrantNotificationEmailSchema>;


export const EmailSchema = z.union([
  AgendaEventCreatedSchema,
  AgendaEventCanceledSchema,
  AgendaEventReminderSchema,
  AgendaEventUpdatedSchema,
  AgendaEventStatusChangedSchema,
  RsvpAcceptedSchema,
  RsvpDeclinedSchema,
  RsvpUnschedulableSchema,
  QuotationCreatedSchema,
  QuotationRepliedSchema,
  QuotationAcceptedSchema,
  QuotationRejectedSchema,
  QuotationAppealedSchema,
  QuotationCanceledSchema,
  AccountVerificationCodeSchema,
  AppointmentReminderEmailSchema,
  ConsentReminderEmailSchema,
  ConfirmationReminderEmailSchema,
  EventAutoCanceledEmailSchema,
  ReviewReminderEmailSchema,
  MonthlyReportEmailSchema,
  // Token notifications
  LowTokenBalanceEmailSchema,
  TokenPurchaseConfirmationEmailSchema,
  TokenGrantNotificationEmailSchema,
]);

export type EmailType = z.infer<typeof EmailSchema>;

export {
  AgendaEventCreatedSchema,
  AgendaEventCanceledSchema,
  AgendaEventReminderSchema,
  AgendaEventUpdatedSchema,
  AgendaEventStatusChangedSchema,
  RsvpAcceptedSchema,
  RsvpDeclinedSchema,
  RsvpUnschedulableSchema,
  QuotationCreatedSchema,
  QuotationRepliedSchema,
  QuotationAcceptedSchema,
  QuotationRejectedSchema,
  QuotationAppealedSchema,
  QuotationCanceledSchema,
  AccountVerificationCodeSchema,
  AppointmentReminderEmailSchema,
  ConsentReminderEmailSchema,
  ConfirmationReminderEmailSchema,
  EventAutoCanceledEmailSchema,
  ReviewReminderEmailSchema,
  MonthlyReportEmailSchema,
  // Token schemas
  // LowTokenBalanceEmailSchema,
  // TokenPurchaseConfirmationEmailSchema,
  // TokenGrantNotificationEmailSchema,
};


// Re-export token email schemas
export {
  LowTokenBalanceEmailSchema,
  TokenPurchaseConfirmationEmailSchema,
  TokenGrantNotificationEmailSchema,
};
