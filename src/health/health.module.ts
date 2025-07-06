import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { HealthController } from './healt.controller';

@Module({
  imports: [
    TerminusModule,
    BullModule.registerQueue({
      name: 'notification',
    }),
  ],
  controllers: [HealthController],
})
export class HealthModule {}
