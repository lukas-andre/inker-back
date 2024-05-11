import { Module } from '@nestjs/common';

import { SendGridClient } from './clients/sendGrid.client';
import { NotificationsController } from './notifications.controller';
import { EmailNotificationService } from './services/email/email.notification';
import { TemplateService } from './services/email/templates/template.service';

@Module({
  providers: [EmailNotificationService, SendGridClient, TemplateService],
  controllers: [NotificationsController],
  exports: [EmailNotificationService],
})
export class NotificationsModule {}
