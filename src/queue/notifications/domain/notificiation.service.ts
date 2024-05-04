import { NotificationEvents } from './notificationEvents';

export interface CustomerNotification {
  template: keyof typeof NotificationEvents;
  customerId: string;
  message: string;
}

export interface INotificationService {
  sendCustomerNotification(notification: CustomerNotification): Promise<void>;
}
