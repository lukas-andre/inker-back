import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';

import { NotificationProcessor } from './processors/notification.processor';
import { NotififcationFactory } from './services/notification.factory';

@Module({
  imports: [
    BullModule.registerQueue({
      name: queues.notification.name,
      redis: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      },
    }),
  ],
  providers: [NotificationProcessor, NotififcationFactory],
})
export class NotificationQueueModule {}
