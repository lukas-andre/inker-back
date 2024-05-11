import { NotificationEvents } from '../domain/agenda.job';
import { NotificationType } from '../domain/schemas/notification';

export interface NotificationQueuePayload {
  customerId: string;
  message: string;
}
