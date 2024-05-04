import { Injectable } from '@nestjs/common';

import { INotificationService } from '../domain/notificiation.service';

import { EmailNotificationService } from './email.notification';
import { PushNotificationService } from './push.notification';

export const NotificationType = {
  email: 'email',
  push: 'push',
} as const;

@Injectable()
export class NotififcationFactory {
  private instances = new Map<
    keyof typeof NotificationType,
    INotificationService
  >();

  createNotificationService(
    type: keyof typeof NotificationType,
  ): INotificationService {
    if (this.instances[type]) {
      return this.instances[type];
    }

    switch (type) {
      case 'email':
        this.instances[type] = new EmailNotificationService();
        break;
      case 'push':
        this.instances[type] = new PushNotificationService();
        break;
    }

    return this.instances[type];
  }
}
