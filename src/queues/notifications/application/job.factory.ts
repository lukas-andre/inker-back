import { Injectable } from '@nestjs/common';

import { AgendaEventProvider } from '../../../agenda/infrastructure/providers/agendaEvent.provider';
import { ArtistProvider } from '../../../artists/infrastructure/database/artist.provider';
import { CustomerProvider } from '../../../customers/infrastructure/providers/customer.provider';
import { ArtistLocationProvider } from '../../../locations/infrastructure/database/artistLocation.provider';
import { EmailNotificationService } from '../../../notifications/services/email/email.notification';
import { JobType } from '../domain/schemas/job';

import { AgendaEventCanceledJob } from './agenda-jobs/agendaEventCanceled.job';
import { AgendaEventCreatedJob } from './agenda-jobs/agendaEventCreated.job';
import { AgendaEventReminderJob } from './agenda-jobs/agendaEventReminder.job';
import { AgendaEventUpdatedJob } from './agenda-jobs/agendaEventUpdated.job';
import { RsvpAcceptedJob } from './agenda-jobs/rsvpAccepted.job';
import { RsvpDeclinedJob } from './agenda-jobs/rsvpDeclined.job';
import { RsvpUnschedulableJob } from './agenda-jobs/rsvpUnschedulable.job';

@Injectable()
export class JobHandlerFactory {
  constructor(
    private readonly emailNotificationService: EmailNotificationService,
    private readonly agendaEventProvider: AgendaEventProvider,
    private readonly artistProvider: ArtistProvider,
    private readonly customerProvider: CustomerProvider,
    private readonly locationProvider: ArtistLocationProvider,
  ) {}
  private readonly agendaEventCreatedJob = new AgendaEventCreatedJob(
    this.emailNotificationService,
    this.agendaEventProvider,
    this.artistProvider,
    this.customerProvider,
    this.locationProvider,
  );
  private readonly agendaEventCanceledJob = new AgendaEventCanceledJob(
    this.emailNotificationService,
    this.agendaEventProvider,
    this.artistProvider,
    this.customerProvider,
    this.locationProvider,
  );
  private readonly agendaEventReminderJob = new AgendaEventReminderJob(
    this.emailNotificationService,
    this.agendaEventProvider,
    this.artistProvider,
    this.customerProvider,
    this.locationProvider,
  );
  private readonly agendaEventUpdatedJob = new AgendaEventUpdatedJob(
    this.emailNotificationService,
    this.agendaEventProvider,
    this.artistProvider,
    this.customerProvider,
    this.locationProvider,
  );
  private readonly rsvpAcceptedJob = new RsvpAcceptedJob();
  private readonly rsvpDeclinedJob = new RsvpDeclinedJob();
  private readonly rsvpUnschedulableJob = new RsvpUnschedulableJob();

  create(job: JobType) {
    switch (job.jobId) {
      case 'EVENT_CREATED':
        return this.agendaEventCreatedJob;
      case 'EVENT_CANCELED':
        return this.agendaEventCanceledJob;
      case 'EVENT_REMINDER':
        return this.agendaEventReminderJob;
      case 'EVENT_UPDATED':
        return this.agendaEventUpdatedJob;
      case 'RSVP_ACCEPTED':
        return this.rsvpAcceptedJob;
      case 'RSVP_DECLINED':
        return this.rsvpDeclinedJob;
      case 'RSVP_UNSCHEDULABLE':
        return this.rsvpUnschedulableJob;
      default:
        throw new Error(`Job type ${job} not implemented`);
    }
  }
}
