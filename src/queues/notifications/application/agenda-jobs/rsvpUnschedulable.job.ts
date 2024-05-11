import { RsvpUnschedulableJobType } from '../../domain/schemas/agenda';

import { AgendaEventJob } from './agendaEvent.job';

export class RsvpUnschedulableJob implements AgendaEventJob {
  async handle(job: RsvpUnschedulableJobType): Promise<void> {
    console.log(
      `Handling EMAIL for RSVP unschedulable for customer ${job.jobId}`,
    );
  }
}
