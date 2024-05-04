import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';

import { queues } from '../queues';

import { DeadLetterProcessor } from './deadletter.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: queues.deadLetter.name,
      redis: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      },
    }),
  ],
  providers: [DeadLetterProcessor],
})
export class DeadLetterQueueModule {}
