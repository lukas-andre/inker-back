import { Module } from '@nestjs/common';

import { ArtistsProviderModule } from '../artists/infrastructure/database/artistProvider.module';
import { CustomerProviderModule } from '../customers/infrastructure/providers/customerProvider.module';
import { MultimediasModule } from '../multimedias/multimedias.module';
import { NotificationQueueModule } from '../queues/notifications/notification.queue.module';
import { ReviewProviderModule } from '../reviews/database/reviewProvider.module';
import { UserProviderModule } from '../users/infrastructure/providers/userProvider.module';

import { AgendaController } from './infrastructure/agenda.controller';
import { AgendaHandler } from './infrastructure/agenda.handler';
import { AgendaProviderModule } from './infrastructure/providers/agendaProvider.module';
import { AddEventUseCase } from './usecases/addEvent.usecase';
import { CancelEventUseCase } from './usecases/cancelEvent.usecase';
import { FindEventByAgendaIdAndEventIdUseCase } from './usecases/findEventByAgendaIdAndEventId.usecase';
import { GetWorkEvidenceByArtistIdUseCase } from './usecases/getWorkEvidenceByArtistId.usecase';
import { ListEventByViewTypeUseCase } from './usecases/listEventByViewType.usecase';
import { MarkEventAsDoneUseCase } from './usecases/markEventAsDone.usecase';
import { UpdateEventUseCase } from './usecases/updateEvent.usecase';

@Module({
  imports: [
    AgendaProviderModule,
    ArtistsProviderModule,
    UserProviderModule,
    CustomerProviderModule,
    ReviewProviderModule,
    MultimediasModule,
    NotificationQueueModule,
  ],
  providers: [
    AgendaHandler,
    AddEventUseCase,
    UpdateEventUseCase,
    CancelEventUseCase,
    ListEventByViewTypeUseCase,
    FindEventByAgendaIdAndEventIdUseCase,
    MarkEventAsDoneUseCase,
    GetWorkEvidenceByArtistIdUseCase,
  ],
  controllers: [AgendaController],
})
export class AgendaModule {}
