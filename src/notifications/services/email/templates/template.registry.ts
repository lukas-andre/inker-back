import path from 'path';

import {
  AccountVerificationCodeSchema,
  AgendaEventCanceledSchema,
  AgendaEventCreatedSchema,
  AgendaEventReminderSchema,
  AgendaEventStatusChangedSchema,
  AgendaEventUpdatedSchema,
  AppointmentReminderEmailSchema,
  ConfirmationReminderEmailSchema,
  ConsentReminderEmailSchema,
  EventAutoCanceledEmailSchema,
  MailIdType,
  MonthlyReportEmailSchema,
  QuotationAcceptedSchema,
  QuotationAppealedSchema,
  QuotationCanceledSchema,
  QuotationCreatedSchema,
  QuotationRejectedSchema,
  QuotationRepliedSchema,
  ReviewReminderEmailSchema,
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
    subject:
      '💈 :customerName Tu próxima cita de con :artistName te espera! No te la pierdas',
  },
  EVENT_CANCELED: {
    schema: AgendaEventCanceledSchema,
    path: path.join(__dirname, './agendaEventCanceled.hbs'),
    subject:
      '💈 :customerName Lamentamos informarte que tu cita con :artistName ha sido cancelada',
  },
  EVENT_REMINDER: {
    schema: AgendaEventReminderSchema,
    path: path.join(__dirname, './agendaEventReminder.hbs'),
    subject: '💈 :customerName Tu cita con :artistName se acerca',
  },
  EVENT_UPDATED: {
    schema: AgendaEventUpdatedSchema,
    path: path.join(__dirname, './agendaEventUpdated.hbs'),
    subject: '💈 :customerName Tu cita con :artistName ha sido actualizada',
  },
  EVENT_STATUS_CHANGED: {
    schema: AgendaEventStatusChangedSchema,
    path: path.join(__dirname, './agendaEventStatusChanged.hbs'),
    subject: '💈 :customerName Estado de tu cita con :artistName actualizado',
  },
  RSVP_ACCEPTED: {
    schema: RsvpAcceptedSchema,
    path: path.join(__dirname, './rsvpAccepted.hbs'),
    subject: '💈 :artistName Tu cita con :customerName ha sido aceptada',
  },
  RSVP_DECLINED: {
    schema: RsvpDeclinedSchema,
    path: path.join(__dirname, './rsvpDeclined.hbs'),
    subject: '💈 :artistName Tu cita con :customerName ha sido rechazada',
  },
  RSVP_UNSCHEDULABLE: {
    schema: RsvpUnschedulableSchema,
    path: path.join(__dirname, './rsvpUnschedulable.hbs'),
    subject: '💈 :artistName Tu cita con :customerName no se pudo agendar',
  },
  QUOTATION_REPLIED: {
    schema: QuotationRepliedSchema,
    path: path.join(__dirname, './quotationReplied.hbs'),
    subject: '💈 :customerName Tu cotización de :artistName ha sido respondida',
  },
  QUOTATION_ACCEPTED: {
    schema: QuotationAcceptedSchema,
    path: path.join(__dirname, './quotationAccepted.hbs'),
    subject: '💈 :customerName Tu cotización de :artistName ha sido aceptada',
  },
  QUOTATION_APPEALED: {
    schema: QuotationAppealedSchema,
    path: path.join(__dirname, './quotationAppealed.hbs'),
    subject: '💈 Hola :artistName, :customerName ha apelado tu cotización',
  },
  QUOTATION_REJECTED: {
    schema: QuotationRejectedSchema,
    path: path.join(__dirname, './quotationRejected.hbs'),
    subject: '💈 :artistName, :customerName ha rechazado tu cotización',
  },
  QUOTATION_CANCELED: {
    schema: QuotationCanceledSchema,
    path: path.join(__dirname, './quotationCanceled.hbs'),
    subject: '💈 Tu cotización ha sido cancelada',
  },
  QUOTATION_CREATED: {
    schema: QuotationCreatedSchema,
    path: path.join(__dirname, './quotationCreated.hbs'),
    subject: '💈 :artistName tienes una nueva cotización de :customerName',
  },
  ACCOUNT_VERIFICATION_CODE: {
    schema: AccountVerificationCodeSchema,
    path: path.join(__dirname, './verificationCode.hbs'),
    subject: '💈 Tu código de verificación',
  },
  APPOINTMENT_REMINDER: {
    schema: AppointmentReminderEmailSchema,
    path: path.join(__dirname, './appointmentReminder.hbs'),
    subject: '💈 :customerName ¡Recordatorio de tu cita con :artistName!',
  },
  CONSENT_REMINDER: {
    schema: ConsentReminderEmailSchema,
    path: path.join(__dirname, './consentReminder.hbs'),
    subject:
      '📋 :customerName Firma el consentimiento para tu cita con :artistName',
  },
  CONFIRMATION_REMINDER: {
    schema: ConfirmationReminderEmailSchema,
    path: path.join(__dirname, './confirmationReminder.hbs'),
    subject:
      '⏰ :customerName ¡Confirma tu cita con :artistName antes de que expire!',
  },
  EVENT_AUTO_CANCELED: {
    schema: EventAutoCanceledEmailSchema,
    path: path.join(__dirname, './eventAutoCanceled.hbs'),
    subject:
      '❌ :customerName Tu cita con :artistName ha sido cancelada automáticamente',
  },
  REVIEW_REMINDER: {
    schema: ReviewReminderEmailSchema,
    path: path.join(__dirname, './reviewReminder.hbs'),
    subject:
      '⭐ :customerName ¡Cuéntanos sobre tu experiencia con :artistName!',
  },
  MONTHLY_REPORT: {
    schema: MonthlyReportEmailSchema,
    path: path.join(__dirname, './monthlyReport.hbs'),
    subject: '📊 :artistName Tu reporte mensual está listo',
  },
};
