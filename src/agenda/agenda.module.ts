import { Module } from '@nestjs/common';

import { ArtistsProviderModule } from '../artists/infrastructure/database/artistProvider.module';
import { CustomerProviderModule } from '../customers/infrastructure/providers/customerProvider.module';
import { LocationProviderModule } from '../locations/infrastructure/database/locationProvider.module';
import { MultimediasModule } from '../multimedias/multimedias.module';
import { NotificationQueueModule } from '../queues/notifications/notification.queue.module';
import { ReviewProviderModule } from '../reviews/database/reviewProvider.module';
import { UserProviderModule } from '../users/infrastructure/providers/userProvider.module';

import { QuotationStateMachine } from './domain/quotation.statemachine';
import { AgendaController } from './infrastructure/agenda.controller';
import { AgendaHandler } from './infrastructure/agenda.handler';
import { AgendaProviderModule } from './infrastructure/providers/agendaProvider.module';
import { AddEventUseCase } from './usecases/addEvent.usecase';
import { CancelEventUseCase } from './usecases/cancelEvent.usecase';
import { CreateQuotationUseCase } from './usecases/createQuotation.usecase';
import { FindEventFromArtistByEventIdUseCase } from './usecases/findEventFromArtistByEventId.usecase';
import { GetQuotationUseCase } from './usecases/getQuotation.usecase';
import { GetQuotationsUseCase } from './usecases/getQuotations.usecase';
import { GetWorkEvidenceByArtistIdUseCase } from './usecases/getWorkEvidenceByArtistId.usecase';
import { ListEventByViewTypeUseCase } from './usecases/listEventByViewType.usecase';
import { ListEventFromArtistAgenda } from './usecases/listEventFromArtistAgenda.usecase';
import { MarkEventAsDoneUseCase } from './usecases/markEventAsDone.usecase';
import { ReplyQuotationUseCase } from './usecases/replyQuotation.usecase';
import { RsvpUseCase } from './usecases/rsvp.usecase';
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
    LocationProviderModule,
  ],
  providers: [
    QuotationStateMachine,
    AgendaHandler,
    AddEventUseCase,
    UpdateEventUseCase,
    CancelEventUseCase,
    ListEventByViewTypeUseCase,
    FindEventFromArtistByEventIdUseCase,
    MarkEventAsDoneUseCase,
    GetWorkEvidenceByArtistIdUseCase,
    ListEventFromArtistAgenda,
    RsvpUseCase,
    CreateQuotationUseCase,
    ReplyQuotationUseCase,
    GetQuotationUseCase,
    GetQuotationsUseCase,
  ],
  controllers: [AgendaController],
})
export class AgendaModule {}
