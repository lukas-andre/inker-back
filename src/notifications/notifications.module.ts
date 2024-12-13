import { Module } from '@nestjs/common';

import { SendGridClient } from './clients/sendGrid.client';
import { NotificationsController } from './notifications.controller';
import { EmailNotificationService } from './services/email/email.notification';
import { TemplateService } from './services/email/templates/template.service';
import { NotificationsDatabaseModule } from './database/notificactionsDatabase.module';
import { FirebaseFcmConfig } from './config/firebaseFcm.config';
import { PushNotificationService } from './services/push/pushNotification.service';

@Module({
  imports: [NotificationsDatabaseModule],
  providers: [
    EmailNotificationService,
    SendGridClient,
    TemplateService,
    PushNotificationService
  ],
  controllers: [NotificationsController],
  exports: [EmailNotificationService, PushNotificationService],
})
export class NotificationsModule {
  constructor() {
    FirebaseFcmConfig.initialize();
  }
}
