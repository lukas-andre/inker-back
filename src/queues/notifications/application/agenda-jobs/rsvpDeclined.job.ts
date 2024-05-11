import { RsvpDeclinedJobType } from '../../domain/schemas/agenda';

import { AgendaEventJob } from './agendaEvent.job';

export class RsvpDeclinedJob implements AgendaEventJob {
  async handle(job: RsvpDeclinedJobType): Promise<void> {
    console.log(`Handling EMAIL for RSVP Declined for customer ${job.jobId}`);
  }
}
