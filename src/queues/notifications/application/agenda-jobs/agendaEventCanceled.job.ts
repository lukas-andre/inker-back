import { EmailNotificationService } from '../../../../notifications/services/email/email.notification';
import { AgendaEventCanceledType } from '../../../../notifications/services/email/schemas/email';
import { AgendaEventCanceledJobType } from '../../domain/schemas/agenda';

import { AgendaEventJob } from './agendaEvent.job';

export class AgendaEventCanceledJob implements AgendaEventJob {
  constructor(
    private readonly emailNotificationService: EmailNotificationService, // add EVENT PROVIDER and CUSTOMER PROVIDER
  ) {}
  async handle(job: AgendaEventCanceledJobType): Promise<void> {
    console.log(
      `Handling EMAIL for event cancellation for customer ${job.jobId}`,
    );
    const agendaEventCanceledEmailData: AgendaEventCanceledType = {
      to: 'lucas.henrydz@gmail.com',
      customerId: job.jobId,
      eventDate: new Date(),
      eventName: '',
      mailId: 'EVENT_CANCELED',
    };
    await this.emailNotificationService.sendEmail(agendaEventCanceledEmailData);
  }
}
