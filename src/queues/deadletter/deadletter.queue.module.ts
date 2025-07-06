import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';

import { queues } from '../queues';

import { DeadLetterProcessor } from './deadletter.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: queues.deadLetter.name,
    }),
  ],
  providers: [DeadLetterProcessor],
  exports: [DeadLetterProcessor],
})
export class DeadLetterQueueModule {}
