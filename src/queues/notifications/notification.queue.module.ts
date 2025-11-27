import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';

import { AgendaRepositoryModule } from '../../agenda/infrastructure/repositories/agendaRepository.module';
import { ArtistsRepositoryModule } from '../../artists/infrastructure/repositories/artistRepository.module';
import { CustomerRepositoryModule } from '../../customers/infrastructure/providers/customerProvider.module';
import { LocationRepositoryModule } from '../../locations/infrastructure/database/locationRepository.module';
import { LocationsModule } from '../../locations/locations.module';
import { NotificationsModule } from '../../notifications/notifications.module';
import { NotificationStorageService } from '../../notifications/services/notification.storage';
import { DeadLetterProcessor } from '../deadletter/deadletter.processor';
import { queues } from '../queues';

import { JobHandlerFactory } from './application/job.factory';
import { NotificationJobRegistry } from './application/job.registry';
import { NotificationProcessor } from './infrastructure/notification.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: queues.deadLetter.name,
    }),
    BullModule.registerQueue({
      name: queues.notification.name,
      defaultJobOptions: {
        attempts: 3,
        lifo: false,
      },
    }),
    NotificationsModule,
    LocationRepositoryModule,
    ArtistsRepositoryModule,
    CustomerRepositoryModule,
    AgendaRepositoryModule,
  ],
  providers: [
    NotificationProcessor,
    JobHandlerFactory,
    NotificationJobRegistry,
    DeadLetterProcessor,
  ],
  exports: [BullModule],
})
export class NotificationQueueModule {}
