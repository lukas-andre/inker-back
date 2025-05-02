import { Module, CacheModule, forwardRef } from '@nestjs/common';

import { ArtistsRepositoryModule } from '../artists/infrastructure/repositories/artistRepository.module';
import { StencilRepositoryModule } from '../artists/infrastructure/repositories/stencilRepository.module';
import { CustomerRepositoryModule } from '../customers/infrastructure/providers/customerProvider.module';
import { LocationRepositoryModule } from '../locations/infrastructure/database/locationRepository.module';
import { MultimediasModule } from '../multimedias/multimedias.module';
import { NotificationQueueModule } from '../queues/notifications/notification.queue.module';
import { ReviewRepositoryModule } from '../reviews/database/reviewRepository.module';

import { QuotationStateMachine } from './domain/quotation.statemachine';
import { AgendaHandler } from './infrastructure/agenda.handler';
import { AgendaController } from './infrastructure/controllers/agenda.controller';
import { QuotationController } from './infrastructure/controllers/quotation.controller';
import { AgendaRepositoryModule } from './infrastructure/repositories/agendaRepository.module';
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
import { ChangeEventStatusUsecase } from './usecases/changeEventStatus.usecase';
import { EventReviewIntegrationUsecase } from './usecases/integrations/eventReviewIntegration.usecase';
import { SyncQueueModule } from '../queues/sync/sync.queue.module';

// New imports for Artist Workflow Improvements
import { AgendaSettingsService } from './services/agendaSettings.service';
import { SchedulingService } from './services/scheduling.service';
import { SetWorkingHoursUseCase } from './usecases/setWorkingHours.usecase';
import { CreateUnavailableTimeUseCase } from './usecases/createUnavailableTime.usecase';
import { GetUnavailableTimesUseCase } from './usecases/getUnavailableTimes.usecase';
import { DeleteUnavailableTimeUseCase } from './usecases/deleteUnavailableTime.usecase';
import { RescheduleEventUseCase } from './usecases/rescheduleEvent.usecase';
import { UpdateEventNotesUseCase } from './usecases/updateEventNotes.usecase';
import { GetArtistAvailabilityUseCase } from './usecases/getArtistAvailability.usecase';
import { GetSuggestedTimeSlotsUseCase } from './usecases/getSuggestedTimeSlots.usecase';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgendaUnavailableTime } from './infrastructure/entities/agendaUnavailableTime.entity';
import { AGENDA_DB_CONNECTION_NAME } from '../databases/constants';
import { AgendaUnavailableTimeRepository } from './infrastructure/repositories/agendaUnavailableTime.provider';
import { UpdateAgendaSettingsUseCase } from './usecases/updateAgendaSettings.usecase';
import { GetAgendaSettingsUseCase } from './usecases/getAgendaSettings.usecase';
import { CreateAgendaEventService } from './usecases/common/createAgendaEvent.service';
import { UserRepositoryModule } from '../users/infrastructure/repositories/userRepository.module';
import { ListOpenQuotationsUseCase } from './usecases/listOpenQuotations.usecase';
import { SubmitQuotationOfferUseCase } from './usecases/submitQuotationOffer.usecase';
import { ListQuotationOffersUseCase } from './usecases/listQuotationOffers.usecase';
import { AcceptQuotationOfferUseCase } from './usecases/acceptQuotationOffer.usecase';
import { TattooGeneratorDatabaseModule } from '../tattoo-generator/infrastructure/database/tattoGeneratorDatabase.module';

@Module({
  imports: [
    CacheModule.register(),
    AgendaRepositoryModule,
    ArtistsRepositoryModule,
    StencilRepositoryModule,
    UserRepositoryModule,
    CustomerRepositoryModule,
    ReviewRepositoryModule,
    MultimediasModule,
    NotificationQueueModule,
    LocationRepositoryModule,
    TattooGeneratorDatabaseModule,
    forwardRef(() => SyncQueueModule),
    TypeOrmModule.forFeature([AgendaUnavailableTime], AGENDA_DB_CONNECTION_NAME),
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
    ChangeEventStatusUsecase,
    EventReviewIntegrationUsecase,
    // Shared services
    CreateAgendaEventService,
    // New services and use cases for Artist Workflow Improvements
    AgendaSettingsService,
    SchedulingService,
    SetWorkingHoursUseCase,
    CreateUnavailableTimeUseCase,
    GetUnavailableTimesUseCase,
    DeleteUnavailableTimeUseCase,
    RescheduleEventUseCase,
    UpdateEventNotesUseCase,
    GetArtistAvailabilityUseCase,
    GetSuggestedTimeSlotsUseCase,
    UpdateAgendaSettingsUseCase,
    GetAgendaSettingsUseCase,
    AgendaUnavailableTimeRepository,
    ListOpenQuotationsUseCase,
    SubmitQuotationOfferUseCase,
    ListQuotationOffersUseCase,
    AcceptQuotationOfferUseCase,
  ],
  controllers: [AgendaController, QuotationController],
  exports: [
    CreateAgendaEventService,
  ]
})
export class AgendaModule {}