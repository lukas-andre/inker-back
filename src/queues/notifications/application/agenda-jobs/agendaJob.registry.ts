import { Injectable } from '@nestjs/common';

import { AgendaEventProvider } from '../../../../agenda/infrastructure/providers/agendaEvent.provider';
import { ArtistProvider } from '../../../../artists/infrastructure/database/artist.provider';
import { CustomerProvider } from '../../../../customers/infrastructure/providers/customer.provider';
import { ArtistLocationProvider } from '../../../../locations/infrastructure/database/artistLocation.provider';
import { EmailNotificationService } from '../../../../notifications/services/email/email.notification';

import { AgendaEventJob } from './agendaEvent.job';
import { AgendaEventCanceledJob } from './agendaEventCanceled.job';
import { AgendaEventCreatedJob } from './agendaEventCreated.job';
import { AgendaEventReminderJob } from './agendaEventReminder.job';
import { AgendaEventUpdatedJob } from './agendaEventUpdated.job';
import { RsvpAcceptedJob } from './rsvpAccepted.job';
import { RsvpDeclinedJob } from './rsvpDeclined.job';
import { RsvpUnschedulableJob } from './rsvpUnschedulable.job';

type AgendaJobConstructor = new (
  emailNotificationService: EmailNotificationService,
  agendaEventProvider: AgendaEventProvider,
  artistProvider: ArtistProvider,
  customerProvider: CustomerProvider,
  locationProvider: ArtistLocationProvider,
) => AgendaEventJob;

@Injectable()
export class AgendaJobRegistry {
  private jobMap: Map<string, AgendaJobConstructor> = new Map();

  constructor() {
    this.jobMap.set('EVENT_CREATED', AgendaEventCreatedJob);
    this.jobMap.set('EVENT_CANCELED', AgendaEventCanceledJob);
    this.jobMap.set('EVENT_REMINDER', AgendaEventReminderJob);
    this.jobMap.set('EVENT_UPDATED', AgendaEventUpdatedJob);
    this.jobMap.set('RSVP_ACCEPTED', RsvpAcceptedJob);
    this.jobMap.set('RSVP_DECLINED', RsvpDeclinedJob);
    this.jobMap.set('RSVP_UNSCHEDULABLE', RsvpUnschedulableJob);
  }

  getJobConstructor(jobId: string): AgendaJobConstructor | undefined {
    return this.jobMap.get(jobId);
  }
}
