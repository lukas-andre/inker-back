import { AgendaEventUpdatedJobType } from '../../domain/schemas/agenda';

import { AgendaEventJob } from './agendaEvent.job';

export class AgendaEventUpdatedJob implements AgendaEventJob {
  async handle(job: AgendaEventUpdatedJobType): Promise<void> {
    console.log(`Handling EMAIL for event update for customer ${job.jobId}`);
  }
}
