import { Module } from '@nestjs/common';

import { ArtistsProviderModule } from '../artists/infrastructure/database/artistProvider.module';
import { CustomerProviderModule } from '../customers/infrastructure/providers/customerProvider.module';
import { LocationProviderModule } from '../locations/infrastructure/database/locationProvider.module';
import { MultimediasModule } from '../multimedias/multimedias.module';
import { NotificationQueueModule } from '../queues/notifications/notification.queue.module';
import { ReviewProviderModule } from '../reviews/database/reviewProvider.module';
import { UserProviderModule } from '../users/infrastructure/providers/userProvider.module';

import { QuotationStateMachine } from './domain/quotation.statemachine';
import { AgendaHandler } from './infrastructure/agenda.handler';
import { AgendaController } from './infrastructure/controllers/agenda.controller';
import { QuotationController } from './infrastructure/controllers/quotation.controller';
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
import { ListEventsByArtistId } from './usecases/listEventsByArtistId.usecase';
import { MarkEventAsDoneUseCase } from './usecases/markEventAsDone.usecase';
import { ProcessArtistActionUseCase } from './usecases/quotation/processArtistAction.usecase';
import { ProcessCustomerActionUseCase } from './usecases/quotation/processCustomerAction.usecase';
import { RsvpUseCase } from './usecases/rsvp.usecase';
import { UpdateEventUseCase } from './usecases/updateEvent.usecase';
import { MarkQuotationAsReadUseCase } from './usecases/quotation/markQuotationAsRead.usecase';

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
    GetQuotationUseCase,
    GetQuotationsUseCase,
    ProcessArtistActionUseCase,
    ProcessCustomerActionUseCase,
    MarkQuotationAsReadUseCase,
    ListEventsByArtistId,
  ],
  controllers: [AgendaController, QuotationController],
})
export class AgendaModule {}
