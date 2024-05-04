import { Injectable } from '@nestjs/common';

import {
  CustomerNotification,
  INotificationService,
} from '../domain/notificiation.service';

export class PushNotificationService implements INotificationService {
  async sendCustomerNotification(payload: CustomerNotification): Promise<void> {
    console.log(
      `Sending email to ${payload.customerId} with template ${payload.template}`,
    );
  }
}
