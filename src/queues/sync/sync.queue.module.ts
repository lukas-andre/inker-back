import { BullModule } from '@nestjs/bull';
import { Module, forwardRef } from '@nestjs/common';
import { queues } from '../queues';
import { SyncProcessor } from './sync.processor';
import { ArtistsRepositoryModule } from '../../artists/infrastructure/repositories/artistRepository.module';
import { ReviewRepositoryModule } from '../../reviews/database/reviewRepository.module';
import { AgendaRepositoryModule } from '../../agenda/infrastructure/repositories/agendaRepository.module';
import { AgendaModule } from '../../agenda/agenda.module';

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
    ArtistsRepositoryModule,
    ReviewRepositoryModule,
    AgendaRepositoryModule,
    forwardRef(() => AgendaModule), // Use forwardRef to avoid circular dependency
  ],
  providers: [SyncProcessor],
  exports: [BullModule],
})
export class SyncQueueModule {}
