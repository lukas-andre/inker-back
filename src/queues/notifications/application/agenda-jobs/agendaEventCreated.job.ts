import { AgendaEventcreatedJobType } from '../../domain/schemas/agenda';

import { AgendaEventJob } from './agendaEvent.job';

export class AgendaEventCreatedJob implements AgendaEventJob {
  async handle(job: AgendaEventcreatedJobType): Promise<void> {
    console.log(`Handling EMAIL for event creation for customer ${job.jobId}`);
  }
}
