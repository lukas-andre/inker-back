import { AgendaEventCanceledJobType } from '../../domain/schemas/agenda';

import { AgendaEventJob } from './agendaEvent.job';

export class AgendaEventCanceledJob implements AgendaEventJob {
  async handle(job: AgendaEventCanceledJobType): Promise<void> {
    console.log(
      `Handling EMAIL for event cancellation for customer ${job.jobId}`,
    );
  }
}
