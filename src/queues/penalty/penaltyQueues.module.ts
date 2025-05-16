import { BullModule, InjectQueue } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { queues } from '../queues';
import { PenaltyProcessorService } from './application/processors/penalty.processor.service';
import { AgendaRepositoryModule } from '../../agenda/infrastructure/repositories/agendaRepository.module'; // For CancellationPenaltyRepository
import { ReputationModule } from '../../reputation/reputation.module'; // Added

@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: queues.penaltyProcessing.name,
        // Assuming Redis config is handled globally by BullModule.forRoot in AppModule
        // or taken from environment variables by default by Bull if not specified here.
        // If specific redis settings are needed for this queue, add them here:
        // redis: {
        //   host: process.env.REDIS_HOST || 'localhost',
        //   port: Number(process.env.REDIS_PORT) || queues.penaltyProcessing.port,
        // },
        defaultJobOptions: {
          attempts: queues.penaltyProcessing.attempts || 3,
          // lifo: false, // Example: if you want LIFO processing for penalties
        },
      },
      {
        name: queues.notification.name, // Adding notification queue for injection
      }
    ),
    AgendaRepositoryModule, // To make CancellationPenaltyRepository available for injection
    ReputationModule, // Added
  ],
  providers: [PenaltyProcessorService],
  exports: [BullModule], // Export BullModule if other modules need to inject this queue by token
})
export class PenaltyQueuesModule {} 