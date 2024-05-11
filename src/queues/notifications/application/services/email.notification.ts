import { NotificationQueueJob } from '../../domain/agenda.job';
import {
  AgendaEvent,
  INotificationService,
} from '../../domain/notificiation.service';
import { AgendaEventJob } from '../agenda-jobs/agendaEvent.job';

class EmailNotificationService implements INotificationService {
  private handlers: Map<string, AgendaEventJob> = new Map();

  constructor() {
    // Aquí registramos todos los manejadores
    this.handlers.set('EVENT_CREATED', new EventCreatedHandler());
    this.handlers.set('EVENT_CANCELED', new EventCanceledHandler());
    // Se pueden agregar más manejadores según sea necesario
  }
  sendAgendaEvent(notification: AgendaEvent): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async handleEvent(job: NotificationQueueJob): Promise<void> {
    const handler = this.handlers.get(job.notificationType);
    if (!handler) {
      throw new Error(
        `No handler registered for event type: ${job.notificationType}`,
      );
    }
    await handler.handle(job);
  }
}
