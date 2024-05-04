import { NotificationEvents } from '../domain/notificationEvents';
import { NotificationType } from '../domain/notificationType';

export interface NotificationQueuePayload {
  notificationType: keyof typeof NotificationType;
  template: keyof typeof NotificationEvents;
  customerId: string;
  message: string;
}
