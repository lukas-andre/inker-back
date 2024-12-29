import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { queues } from '../queues';
import { SyncProcessor } from './sync.processor';
import { ArtistsProviderModule } from '../../artists/infrastructure/database/artistProvider.module';
import { ReviewProviderModule } from '../../reviews/database/reviewProvider.module';
import { AgendaProviderModule } from '../../agenda/infrastructure/providers/agendaProvider.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: queues.sync.name,
      defaultJobOptions: {
        attempts: 3,
        lifo: false,
      },
    }),
    BullModule.registerQueue({
      name: queues.deadLetter.name,
    }),
    ArtistsProviderModule,
    ReviewProviderModule,
    AgendaProviderModule,
  ],
  providers: [SyncProcessor],
  exports: [BullModule],
})
export class SyncQueueModule {}
