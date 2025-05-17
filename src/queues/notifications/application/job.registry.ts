import { Injectable } from '@nestjs/common';

import { AgendaEventRepository } from '../../../agenda/infrastructure/repositories/agendaEvent.repository';
import { QuotationRepository } from '../../../agenda/infrastructure/repositories/quotation.provider';
import { ArtistRepository } from '../../../artists/infrastructure/repositories/artist.repository';
import { CustomerRepository } from '../../../customers/infrastructure/providers/customer.repository';
import { ArtistLocationRepository } from '../../../locations/infrastructure/database/artistLocation.repository';
import { EmailNotificationService } from '../../../notifications/services/email/email.notification';
import { JobTypeKey } from '../domain/jobSchema.registry';

import { AgendaEventCanceledJob } from './jobs/agenda/agendaEventCanceled.job';
import { AgendaEventCreatedJob } from './jobs/agenda/agendaEventCreated.job';
import { AgendaEventReminderJob } from './jobs/agenda/agendaEventReminder.job';
import { AgendaEventStatusChangedJob } from './jobs/agenda/agendaEventStatusChanged.job';
import { AgendaEventUpdatedJob } from './jobs/agenda/agendaEventUpdated.job';
import { NotificationJob } from './jobs/notification.job';
import { QuotationAcceptedJob } from './jobs/quotations/quotationAccepeted.job';
import { QuotationAppealedJob } from './jobs/quotations/quotationAppealed.job';
import { QuotationCanceledJob } from './jobs/quotations/quotationCanceled.job';
import { QuotationCreatedJob } from './jobs/quotations/quotationCreated.job';
import { QuotationRejectedJob } from './jobs/quotations/quotationRejected.job';
import { QuotationRepliedJob } from './jobs/quotations/quotationReplied.job';
import { RsvpAcceptedJob } from './jobs/rsvp/rsvpAccepted.job';
import { RsvpDeclinedJob } from './jobs/rsvp/rsvpDeclined.job';
import { RsvpUnschedulableJob } from './jobs/rsvp/rsvpUnschedulable.job';
import { PushNotificationService } from '../../../notifications/services/push/pushNotification.service';
import { VerificationCodeSentJob } from './jobs/codes/verficationCodeSent.job';
import { NotificationStorageService } from '../../../notifications/services/notification.storage';
import { NewOfferReceivedJob } from './jobs/quotationOffers/newOfferReceived.job';
import { OfferAcceptedJob } from './jobs/quotationOffers/offerAccepted.job';
import { OfferRejectedJob } from './jobs/quotationOffers/offerRejected.job';
import { PenaltyAppliedNotificationJob } from './jobs/penaltyAppliedNotification.job';
import { PENALTY_APPLIED_NOTIFICATION_V1 } from '../domain/schemas/penaltyNotification.schema';
import { NewEventMessageJob } from './jobs/agenda/newEventMessage.job';

type NotificationJobConstructor = new (
  emailNotificationService: EmailNotificationService,
  agendaEventProvider: AgendaEventRepository,
  artistProvider: ArtistRepository,
  customerProvider: CustomerRepository,
  locationProvider: ArtistLocationRepository,
  quotationProvider: QuotationRepository,
  pushNotificationService: PushNotificationService,
  notificationStorageService: NotificationStorageService,
) => NotificationJob;

@Injectable()
export class NotificationJobRegistry {
  private jobMap: Map<JobTypeKey, NotificationJobConstructor> = new Map();

  constructor() {
    this.jobMap.set('EVENT_CREATED', AgendaEventCreatedJob);
    this.jobMap.set('EVENT_CANCELED', AgendaEventCanceledJob);
    this.jobMap.set('EVENT_REMINDER', AgendaEventReminderJob);
    this.jobMap.set('EVENT_UPDATED', AgendaEventUpdatedJob);
    this.jobMap.set('EVENT_STATUS_CHANGED', AgendaEventStatusChangedJob);
    this.jobMap.set('RSVP_ACCEPTED', RsvpAcceptedJob);
    this.jobMap.set('RSVP_DECLINED', RsvpDeclinedJob);
    this.jobMap.set('RSVP_UNSCHEDULABLE', RsvpUnschedulableJob);

    this.jobMap.set('QUOTATION_CREATED', QuotationCreatedJob);
    this.jobMap.set('QUOTATION_REPLIED', QuotationRepliedJob);
    this.jobMap.set('QUOTATION_ACCEPTED', QuotationAcceptedJob);
    this.jobMap.set('QUOTATION_REJECTED', QuotationRejectedJob);
    this.jobMap.set('QUOTATION_APPEALED', QuotationAppealedJob);
    this.jobMap.set('QUOTATION_CANCELED', QuotationCanceledJob);

    this.jobMap.set('NEW_OFFER_RECEIVED', NewOfferReceivedJob);
    this.jobMap.set('OFFER_ACCEPTED', OfferAcceptedJob);
    this.jobMap.set('OFFER_REJECTED', OfferRejectedJob);

    this.jobMap.set('ACCOUNT_VERIFICATION_CODE', VerificationCodeSentJob);

    this.jobMap.set(PENALTY_APPLIED_NOTIFICATION_V1, PenaltyAppliedNotificationJob);
    this.jobMap.set('NEW_EVENT_MESSAGE', NewEventMessageJob);
  }

  getJobConstructor(jobId: JobTypeKey): NotificationJobConstructor | undefined {
    return this.jobMap.get(jobId);
  }
}
