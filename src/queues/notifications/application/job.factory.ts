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
  create(job: JobType) {
    switch (job.jobId) {
      case 'EVENT_CREATED':
        return new AgendaEventCreatedJob();
      case 'EVENT_CANCELED':
        return new AgendaEventCanceledJob();
      case 'EVENT_REMINDER':
        return new AgendaEventReminderJob();
      case 'EVENT_UPDATED':
        return new AgendaEventUpdatedJob();
      case 'RSVP_ACCEPTED':
        return new RsvpAcceptedJob();
      case 'RSVP_DECLINED':
        return new RsvpDeclinedJob();
      case 'RSVP_UNSCHEDULABLE':
        return new RsvpUnschedulableJob();
      default:
        throw new Error(`Job type ${job} not implemented`);
    }
  }
}
