import { AgendaEventReminderJobType } from '../../domain/schemas/agenda';

import { AgendaEventJob } from './agendaEvent.job';

export class AgendaEventReminderJob implements AgendaEventJob {
  async handle(job: AgendaEventReminderJobType): Promise<void> {
    console.log(`Handling EMAIL for event update for customer ${job.jobId}`);
  }
}
