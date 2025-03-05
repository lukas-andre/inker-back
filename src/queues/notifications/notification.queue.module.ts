import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';

import { AgendaProviderModule } from '../../agenda/infrastructure/providers/agendaProvider.module';
import { ArtistsProviderModule } from '../../artists/infrastructure/database/artistProvider.module';
import { CustomerProviderModule } from '../../customers/infrastructure/providers/customerProvider.module';
import { LocationProviderModule } from '../../locations/infrastructure/database/locationProvider.module';
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
    LocationProviderModule,
    ArtistsProviderModule,
    CustomerProviderModule,
    AgendaProviderModule,
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
