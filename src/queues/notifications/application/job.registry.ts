import { Injectable } from '@nestjs/common';

import { AgendaEventProvider } from '../../../agenda/infrastructure/providers/agendaEvent.provider';
import { QuotationProvider } from '../../../agenda/infrastructure/providers/quotation.provider';
import { ArtistProvider } from '../../../artists/infrastructure/database/artist.provider';
import { CustomerProvider } from '../../../customers/infrastructure/providers/customer.provider';
import { ArtistLocationProvider } from '../../../locations/infrastructure/database/artistLocation.provider';
import { EmailNotificationService } from '../../../notifications/services/email/email.notification';
import { JobTypeKey } from '../domain/jobSchema.registry';

import { AgendaEventCanceledJob } from './jobs/agenda/agendaEventCanceled.job';
import { AgendaEventCreatedJob } from './jobs/agenda/agendaEventCreated.job';
import { AgendaEventReminderJob } from './jobs/agenda/agendaEventReminder.job';
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

type NotificationJobConstructor = new (
  emailNotificationService: EmailNotificationService,
  agendaEventProvider: AgendaEventProvider,
  artistProvider: ArtistProvider,
  customerProvider: CustomerProvider,
  locationProvider: ArtistLocationProvider,
  quotationProvider: QuotationProvider,
  pushNotificationService: PushNotificationService,
) => NotificationJob;

@Injectable()
export class NotificationJobRegistry {
  private jobMap: Map<JobTypeKey, NotificationJobConstructor> = new Map();

  constructor() {
    this.jobMap.set('EVENT_CREATED', AgendaEventCreatedJob);
    this.jobMap.set('EVENT_CANCELED', AgendaEventCanceledJob);
    this.jobMap.set('EVENT_REMINDER', AgendaEventReminderJob);
    this.jobMap.set('EVENT_UPDATED', AgendaEventUpdatedJob);
    this.jobMap.set('RSVP_ACCEPTED', RsvpAcceptedJob);
    this.jobMap.set('RSVP_DECLINED', RsvpDeclinedJob);
    this.jobMap.set('RSVP_UNSCHEDULABLE', RsvpUnschedulableJob);

    this.jobMap.set('QUOTATION_CREATED', QuotationCreatedJob);
    this.jobMap.set('QUOTATION_REPLIED', QuotationRepliedJob);
    this.jobMap.set('QUOTATION_ACCEPTED', QuotationAcceptedJob);
    this.jobMap.set('QUOTATION_REJECTED', QuotationRejectedJob);
    this.jobMap.set('QUOTATION_APPEALED', QuotationAppealedJob);
    this.jobMap.set('QUOTATION_CANCELED', QuotationCanceledJob);
  }

  getJobConstructor(jobId: JobTypeKey): NotificationJobConstructor | undefined {
    return this.jobMap.get(jobId);
  }
}
