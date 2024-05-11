import { RsvpAcceptedJobType } from '../../domain/schemas/agenda';

import { AgendaEventJob } from './agendaEvent.job';

export class RsvpAcceptedJob implements AgendaEventJob {
  async handle(job: RsvpAcceptedJobType): Promise<void> {
    console.log(`Handling EMAIL for RSVP accepted for customer ${job.jobId}`);
  }
}
