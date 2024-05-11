import { EmailNotificationService } from '../../../../notifications/services/email/email.notification';
import {
  AgendaEventCanceledType,
  AgendaEventCreatedType,
} from '../../../../notifications/services/email/schemas/email';
import { AgendaEventcreatedJobType } from '../../domain/schemas/agenda';

import { AgendaEventJob } from './agendaEvent.job';

export class AgendaEventCreatedJob implements AgendaEventJob {
  constructor(
    private readonly emailNotificationService: EmailNotificationService,
  ) {}
  async handle(job: AgendaEventcreatedJobType): Promise<void> {
    const agendaEventCanceledEmailData: AgendaEventCreatedType = {
      to: 'lucas.henrydz@gmail.com',
      artistName: 'mock',
      customerName: 'mock',
      eventLocation: 'mock',
      googleMapsLink: 'mock',
      eventDate: new Date(),
      eventName: job.metadata.eventId,
      mailId: 'EVENT_CREATED',
      templateId: 'd-fd173c79745449a38b2064426bc1101c',
    };
    await this.emailNotificationService.sendEmail(agendaEventCanceledEmailData);
  }
}
