import { z } from 'zod';

import { UserType } from '../../../../users/domain/enums/userType.enum';

import {
  NotificationTypeEmail,
  NotificationTypeEmailAndPush,
  NotificationTypePush,
} from './notification';
export const EVENT_STATUS_CHANGED = 'EVENT_STATUS_CHANGED' as const;
export const EVENT_REMINDER = 'EVENT_REMINDER' as const;
export const EVENT_CONFIRMED_BY_CUSTOMER =
  'EVENT_CONFIRMED_BY_CUSTOMER' as const;
export const EVENT_REJECTED_BY_CUSTOMER = 'EVENT_REJECTED_BY_CUSTOMER' as const;
export const EVENT_RESCHEDULED_BY_ARTIST =
  'EVENT_RESCHEDULED_BY_ARTIST' as const;
export const EVENT_RESCHEDULED_BY_CUSTOMER =
  'EVENT_RESCHEDULED_BY_CUSTOMER' as const;
export const RSVP_ACCEPTED = 'RSVP_ACCEPTED' as const;
export const RSVP_DECLINED = 'RSVP_DECLINED' as const;
export const RSVP_UNSCHEDULABLE = 'RSVP_UNSCHEDULABLE' as const;
export const NewEventMessageJobId = 'NEW_EVENT_MESSAGE' as const;

// New scheduled notification job IDs
export const APPOINTMENT_REMINDER = 'APPOINTMENT_REMINDER' as const;
export const CONSENT_REMINDER = 'CONSENT_REMINDER' as const;
export const CONFIRMATION_REMINDER = 'CONFIRMATION_REMINDER' as const;
export const EVENT_AUTO_CANCELED = 'EVENT_AUTO_CANCELED' as const;
export const REVIEW_REMINDER = 'REVIEW_REMINDER' as const;
export const PHOTO_UPLOAD_REMINDER = 'PHOTO_UPLOAD_REMINDER' as const;
export const MONTHLY_REPORT = 'MONTHLY_REPORT' as const;

export const AgendaJobIdSchema = z.enum([
  'EVENT_CREATED',
  'EVENT_CANCELED',
  'EVENT_REMINDER',
  'EVENT_UPDATED',
  'EVENT_STATUS_CHANGED',
  'RSVP_ACCEPTED',
  'RSVP_DECLINED',
  'RSVP_UNSCHEDULABLE',
  'EVENT_RESCHEDULED_BY_ARTIST',
  'EVENT_RESCHEDULED_BY_CUSTOMER',
  NewEventMessageJobId,
  // New scheduled notifications
  APPOINTMENT_REMINDER,
  CONSENT_REMINDER,
  CONFIRMATION_REMINDER,
  EVENT_AUTO_CANCELED,
  REVIEW_REMINDER,
  PHOTO_UPLOAD_REMINDER,
  MONTHLY_REPORT,
]);
export type AgendaJobIdType = z.infer<typeof AgendaJobIdSchema>;

const AgendaJobSchema = z.object({
  jobId: AgendaJobIdSchema,
  notificationTypeId: z.enum([
    NotificationTypePush,
    NotificationTypeEmail,
    NotificationTypeEmailAndPush,
  ]),
  metadata: z.object({
    customerId: z.string(),
    eventId: z.string(),
    artistId: z.string(),
  }),
});

export type AgendaJobType = z.infer<typeof AgendaJobSchema>;

const AgendaEventCreatedJobSchema = AgendaJobSchema.extend({
  jobId: z.literal(AgendaJobIdSchema.enum.EVENT_CREATED),
});
export type AgendaEventcreatedJobType = z.infer<
  typeof AgendaEventCreatedJobSchema
>;

const AgendaEventCanceledJobSchema = AgendaJobSchema.extend({
  jobId: z.literal(AgendaJobIdSchema.enum.EVENT_CANCELED),
});
export type AgendaEventCanceledJobType = z.infer<
  typeof AgendaEventCanceledJobSchema
>;

const AgendaEventReminderJobSchema = AgendaJobSchema.extend({
  jobId: z.literal(AgendaJobIdSchema.enum.EVENT_REMINDER),
  metadata: z.object({
    customerId: z.string(),
    eventId: z.string(),
    artistId: z.string(),
    reminderType: z.string().optional(),
  }),
});
export type AgendaEventReminderJobType = z.infer<
  typeof AgendaEventReminderJobSchema
>;

const AgendaEventUpdatedJobSchema = AgendaJobSchema.extend({
  jobId: z.literal(AgendaJobIdSchema.enum.EVENT_UPDATED),
});
export type AgendaEventUpdatedJobType = z.infer<
  typeof AgendaEventUpdatedJobSchema
>;

const RsvpAcceptedJobSchema = AgendaJobSchema.extend({
  jobId: z.literal(AgendaJobIdSchema.enum.RSVP_ACCEPTED),
});
export type RsvpAcceptedJobType = z.infer<typeof RsvpAcceptedJobSchema>;

const RsvpDeclinedJobSchema = AgendaJobSchema.extend({
  jobId: z.literal(AgendaJobIdSchema.enum.RSVP_DECLINED),
});
export type RsvpDeclinedJobType = z.infer<typeof RsvpDeclinedJobSchema>;

const RsvpUnschedulableJobSchema = AgendaJobSchema.extend({
  jobId: z.literal(AgendaJobIdSchema.enum.RSVP_UNSCHEDULABLE),
});
export type RsvpUnschedulableJobType = z.infer<
  typeof RsvpUnschedulableJobSchema
>;

export type RsvpJobType =
  | RsvpAcceptedJobType
  | RsvpDeclinedJobType
  | RsvpUnschedulableJobType;

const AgendaEventStatusChangedJobSchema = AgendaJobSchema.extend({
  jobId: z.literal(AgendaJobIdSchema.enum.EVENT_STATUS_CHANGED),
  metadata: z.object({
    customerId: z.string(),
    eventId: z.string(),
    artistId: z.string(),
    status: z.string(),
    message: z.string(),
  }),
});
export type AgendaEventStatusChangedJobType = z.infer<
  typeof AgendaEventStatusChangedJobSchema
>;

const EventRescheduledByArtistJobSchema = AgendaJobSchema.extend({
  jobId: z.literal(EVENT_RESCHEDULED_BY_ARTIST),
});
export type EventRescheduledByArtistJob = z.infer<
  typeof EventRescheduledByArtistJobSchema
>;

const EventRescheduledByCustomerJobSchema = AgendaJobSchema.extend({
  jobId: z.literal(EVENT_RESCHEDULED_BY_CUSTOMER),
});
export type EventRescheduledByCustomerJob = z.infer<
  typeof EventRescheduledByCustomerJobSchema
>;

const NewEventMessageJobSchema = z.object({
  jobId: z.literal(NewEventMessageJobId),
  notificationTypeId: z.literal(NotificationTypePush),
  metadata: z.object({
    eventId: z.string().uuid(),
    agendaId: z.string().uuid(),
    senderId: z.string(),
    senderUserType: z.nativeEnum(UserType),
    receiverUserTypeId: z.string(),
    messageSnippet: z
      .string()
      .max(100)
      .describe('First 100 characters of the message'),
    senderName: z
      .string()
      .optional()
      .describe('Name of the message sender, if available'),
  }),
});
export type NewEventMessageJob = z.infer<typeof NewEventMessageJobSchema>;

// New scheduled notification schemas
const AppointmentReminderJobSchema = AgendaJobSchema.extend({
  jobId: z.literal(APPOINTMENT_REMINDER),
  metadata: z.object({
    customerId: z.string(),
    eventId: z.string(),
    artistId: z.string(),
    reminderType: z.string(),
    appointmentDate: z.string(),
    eventTitle: z.string(),
  }),
});
export type AppointmentReminderJobType = z.infer<
  typeof AppointmentReminderJobSchema
>;

const ConsentReminderJobSchema = AgendaJobSchema.extend({
  jobId: z.literal(CONSENT_REMINDER),
  metadata: z.object({
    customerId: z.string(),
    eventId: z.string(),
    artistId: z.string(),
    reminderType: z.string(),
    appointmentDate: z.string(),
  }),
});
export type ConsentReminderJobType = z.infer<typeof ConsentReminderJobSchema>;

const ConfirmationReminderJobSchema = AgendaJobSchema.extend({
  jobId: z.literal(CONFIRMATION_REMINDER),
  metadata: z.object({
    customerId: z.string(),
    eventId: z.string(),
    artistId: z.string(),
    hoursRemaining: z.number(),
  }),
});
export type ConfirmationReminderJobType = z.infer<
  typeof ConfirmationReminderJobSchema
>;

const EventAutoCanceledJobSchema = AgendaJobSchema.extend({
  jobId: z.literal(EVENT_AUTO_CANCELED),
  metadata: z.object({
    customerId: z.string(),
    eventId: z.string(),
    artistId: z.string(),
    reason: z.string(),
  }),
});
export type EventAutoCanceledJobType = z.infer<
  typeof EventAutoCanceledJobSchema
>;

const ReviewReminderJobSchema = AgendaJobSchema.extend({
  jobId: z.literal(REVIEW_REMINDER),
  metadata: z.object({
    customerId: z.string(),
    eventId: z.string(),
    artistId: z.string(),
    reminderType: z.string(),
  }),
});
export type ReviewReminderJobType = z.infer<typeof ReviewReminderJobSchema>;

const PhotoUploadReminderJobSchema = z.object({
  jobId: z.literal(PHOTO_UPLOAD_REMINDER),
  notificationTypeId: z.literal(NotificationTypePush),
  metadata: z.object({
    eventId: z.string(),
    artistId: z.string(),
    customerId: z.string(),
    reminderType: z.string(),
  }),
});
export type PhotoUploadReminderJobType = z.infer<
  typeof PhotoUploadReminderJobSchema
>;

const MonthlyReportJobSchema = z.object({
  jobId: z.literal(MONTHLY_REPORT),
  notificationTypeId: z.literal(NotificationTypeEmail),
  metadata: z.object({
    artistId: z.string(),
    email: z.string(),
    reportMonth: z.string(),
    artistName: z.string(),
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
  }),
});
export type MonthlyReportJobType = z.infer<typeof MonthlyReportJobSchema>;

export {
  AgendaEventCreatedJobSchema,
  AgendaEventCanceledJobSchema,
  AgendaEventReminderJobSchema,
  AgendaEventUpdatedJobSchema,
  AgendaEventStatusChangedJobSchema,
  RsvpAcceptedJobSchema,
  RsvpDeclinedJobSchema,
  RsvpUnschedulableJobSchema,
  EventRescheduledByArtistJobSchema,
  EventRescheduledByCustomerJobSchema,
  NewEventMessageJobSchema,
  AppointmentReminderJobSchema,
  ConsentReminderJobSchema,
  ConfirmationReminderJobSchema,
  EventAutoCanceledJobSchema,
  ReviewReminderJobSchema,
  PhotoUploadReminderJobSchema,
  MonthlyReportJobSchema,
};
