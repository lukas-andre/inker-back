import { NotificationType } from '../services/notification.factory';

import { NotificationEvents } from './events';

export interface CustomerNotification {
  notificationType: keyof typeof NotificationType;
  template: keyof typeof NotificationEvents;
  customerId: string;
  message: string;
}

export interface INotificationService {
  sendCustomerNotification(notification: CustomerNotification): Promise<void>;
}
