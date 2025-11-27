import { Module } from '@nestjs/common';

import { NotificationsModule } from '../notifications/notifications.module';
import { ContactController } from './infrastructure/controllers/contact.controller';
import { ProcessContactMessageUseCase } from './usecases/processContactMessage.usecase';

@Module({
  imports: [NotificationsModule],
  controllers: [ContactController],
  providers: [ProcessContactMessageUseCase],
})
export class ContactModule {}