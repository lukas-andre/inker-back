import { Module } from '@nestjs/common';

import { SendGridClient } from './clients/sendGrid.client';
import { NotificationsController } from './notifications.controller';
import { NotificationsHandler } from './notifications.handler';
import { EmailNotificationService } from './services/email/email.notification';
import { TemplateService } from './services/email/templates/template.service';
import { NotificationsRepositoryModule } from './database/notificactionsRepository.module';
import { FirebaseFcmConfig } from './config/firebaseFcm.config';
import { PushNotificationService } from './services/push/pushNotification.service';
import { NotificationStorageService } from './services/notification.storage';
import { GetNotificationsUsecase } from './usecases/get-notifications.usecase';
import { MarkNotificationReadUsecase } from './usecases/mark-notification-read.usecase';
import { MarkAllNotificationsReadUsecase } from './usecases/mark-all-notifications-read.usecase';
import { DeleteNotificationUsecase } from './usecases/delete-notification.usecase';
import { GlobalModule } from '../global/global.module';

@Module({
  imports: [
    NotificationsRepositoryModule,
    GlobalModule,
  ],
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
    NotificationStorageService
  ],
})
export class NotificationsModule {
  constructor() {
    FirebaseFcmConfig.initialize();
  }
}
