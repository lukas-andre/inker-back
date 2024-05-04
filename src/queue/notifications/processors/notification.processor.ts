import { Process } from '@nestjs/bull';
import { Job } from 'bull';

import {
  CustomerNotification,
  INotificationService,
} from '../domain/notificiation.service';

export class NotificationProcessor {
  constructor(private readonly notificationService: INotificationService) {}
  @Process(queues.notification.name)
  async process(job: Job<CustomerNotification>) {
    const { template, customerId, message, notificationType } = job.data;
    await this.notificationService.sendCustomerNotification({
      notificationType,
      template,
      customerId,
      message,
    });
  }
}
