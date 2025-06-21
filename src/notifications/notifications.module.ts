import { Module } from '@nestjs/common';

import { GlobalModule } from '../global/global.module';

import { SendGridClient } from './clients/sendGrid.client';
import { FirebaseFcmConfig } from './config/firebaseFcm.config';
import { NotificationsRepositoryModule } from './database/notificactionsRepository.module';
import { NotificationsController } from './notifications.controller';
import { NotificationsHandler } from './notifications.handler';
import { EmailNotificationService } from './services/email/email.notification';
import { TemplateService } from './services/email/templates/template.service';
import { NotificationStorageService } from './services/notification.storage';
import { PushNotificationService } from './services/push/pushNotification.service';
import { DeleteNotificationUsecase } from './usecases/delete-notification.usecase';
import { GetNotificationsUsecase } from './usecases/get-notifications.usecase';
import { MarkAllNotificationsReadUsecase } from './usecases/mark-all-notifications-read.usecase';
import { MarkNotificationReadUsecase } from './usecases/mark-notification-read.usecase';

@Module({
  imports: [NotificationsRepositoryModule, GlobalModule],
  providers: [
    // Services
    EmailNotificationService,
    SendGridClient,
    TemplateService,
    PushNotificationService,
    NotificationStorageService,

    // Handler
    NotificationsHandler,

    // Usecases
    GetNotificationsUsecase,
    MarkNotificationReadUsecase,
    MarkAllNotificationsReadUsecase,
    DeleteNotificationUsecase,
  ],
  controllers: [NotificationsController],
  exports: [
    EmailNotificationService,
    PushNotificationService,
    NotificationStorageService,
  ],
})
export class NotificationsModule {
  constructor() {
    FirebaseFcmConfig.initialize();
  }
}
