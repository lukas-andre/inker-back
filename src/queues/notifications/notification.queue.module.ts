import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';

import { NotificationsModule } from '../../notifications/notifications.module';
import { DeadLetterProcessor } from '../deadletter/deadletter.processor';
import { queues } from '../queues';

import { JobHandlerFactory } from './application/job.factory';
import { NotificationProcessor } from './infrastructure/notification.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: queues.deadLetter.name,
      redis: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      },
    }),
    BullModule.registerQueue({
      name: queues.notification.name,
      defaultJobOptions: {
        attempts: 3,
        lifo: false,
      },
      redis: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      },
    }),
    NotificationsModule,
  ],
  providers: [NotificationProcessor, JobHandlerFactory, DeadLetterProcessor],
})
export class NotificationQueueModule {}
