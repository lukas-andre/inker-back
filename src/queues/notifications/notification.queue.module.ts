import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';

import { DeadLetterQueueModule } from '../deadletter/deadletter.queue.module';
import { queues } from '../queues';

import { JobHandlerFactory } from './application/job.factory';
import { NotificationProcessor } from './infrastructure/notification.processor';

@Module({
  imports: [
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
    DeadLetterQueueModule,
  ],
  providers: [NotificationProcessor, JobHandlerFactory],
})
export class NotificationQueueModule {}
