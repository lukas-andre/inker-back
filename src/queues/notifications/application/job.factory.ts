import { Injectable } from '@nestjs/common';

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
  private readonly agendaEventCreatedJob = new AgendaEventCreatedJob();
  private readonly agendaEventCanceledJob = new AgendaEventCanceledJob();
  private readonly agendaEventReminderJob = new AgendaEventReminderJob();
  private readonly agendaEventUpdatedJob = new AgendaEventUpdatedJob();
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
