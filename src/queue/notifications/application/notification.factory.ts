import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';

import { sendGridConfig } from '../../../config/sendgrid.config';
import { SendGridClient } from '../../../notifications/clients/sendGrid.client';
import { NotificationType } from '../domain/notificationType';
import { INotificationService } from '../domain/notificiation.service';

import { EmailNotificationService } from './services/email.notification';
import { PushNotificationService } from './services/push.notification';

@Injectable()
export class NotificationFactory {
  constructor(
    @Inject(sendGridConfig.KEY)
    private sendGridConf: ConfigType<typeof sendGridConfig>,
  ) {}

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
      case NotificationType.EMAIL:
        this.instances[type] = new EmailNotificationService(
          new SendGridClient(this.sendGridConf),
        );
        break;
      case NotificationType.PUSH:
        this.instances[type] = new PushNotificationService();
        break;
    }

    return this.instances[type];
  }
}
