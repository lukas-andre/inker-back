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
import { AddEventUseCase } from './usecases/event/addEvent.usecase';
import { CreateQuotationUseCase } from './usecases/quotation/createQuotation.usecase';
import { FindEventFromArtistByEventIdUseCase } from './usecases/agenda/findEventFromArtistByEventId.usecase';
import { GetQuotationUseCase } from './usecases/quotation/getQuotation.usecase';
import { GetQuotationsUseCase } from './usecases/quotation/getQuotations.usecase';
import { GetWorkEvidenceByArtistIdUseCase } from './usecases/getWorkEvidenceByArtistId.usecase';
import { ListEventByViewTypeUseCase } from './usecases/event/listEventByViewType.usecase';
import { ListEventFromArtistAgenda } from './usecases/event/listEventFromArtistAgenda.usecase';
import { ListEventsByArtistId } from './usecases/event/listEventsByArtistId.usecase';
import { MarkEventAsDoneUseCase } from './usecases/event/markEventAsDone.usecase';
import { ProcessArtistActionUseCase } from './usecases/quotation/processArtistAction.usecase';
import { ProcessCustomerActionUseCase } from './usecases/quotation/processCustomerAction.usecase';
import { RsvpUseCase } from './usecases/event/rsvp.usecase';
import { UpdateEventUseCase } from './usecases/event/updateEvent.usecase';
import { MarkQuotationAsReadUseCase } from './usecases/quotation/markQuotationAsRead.usecase';
import { ChangeEventStatusUsecase } from './usecases/event/changeEventStatus.usecase';
import { EventReviewIntegrationUsecase } from './usecases/event/eventReviewIntegration.usecase';
import { SyncQueueModule } from '../queues/sync/sync.queue.module';

// New imports for Artist Workflow Improvements
import { AgendaSettingsService } from './services/agendaSettings.service';
import { SchedulingService } from './services/scheduling.service';
import { SetWorkingHoursUseCase } from './usecases/agenda/setWorkingHours.usecase';
import { CreateUnavailableTimeUseCase } from './usecases/agenda/createUnavailableTime.usecase';
import { GetUnavailableTimesUseCase } from './usecases/agenda/getUnavailableTimes.usecase';
import { DeleteUnavailableTimeUseCase } from './usecases/agenda/deleteUnavailableTime.usecase';
import { RescheduleEventUseCase } from './usecases/event/rescheduleEvent.usecase';
import { UpdateEventNotesUseCase } from './usecases/event/updateEventNotes.usecase';
import { GetArtistAvailabilityUseCase } from './usecases/agenda/getArtistAvailability.usecase';
import { GetSuggestedTimeSlotsUseCase } from './usecases/agenda/getSuggestedTimeSlots.usecase';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgendaUnavailableTime } from './infrastructure/entities/agendaUnavailableTime.entity';
import { AGENDA_DB_CONNECTION_NAME } from '../databases/constants';
import { AgendaUnavailableTimeRepository } from './infrastructure/repositories/agendaUnavailableTime.provider';
import { UpdateAgendaSettingsUseCase } from './usecases/agenda/updateAgendaSettings.usecase';
import { GetAgendaSettingsUseCase } from './usecases/agenda/getAgendaSettings.usecase';
import { CreateAgendaEventService } from './domain/services/createAgendaEvent.service';
import { UserRepositoryModule } from '../users/infrastructure/repositories/userRepository.module';
import { SubmitQuotationOfferUseCase } from './usecases/offer/submitQuotationOffer.usecase';
import { ListQuotationOffersUseCase } from './usecases/offer/listQuotationOffers.usecase';
import { AcceptQuotationOfferUseCase } from './usecases/offer/acceptQuotationOffer.usecase';
import { TattooGeneratorDatabaseModule } from '../tattoo-generator/infrastructure/database/tattoGeneratorDatabase.module';
import { SendOfferMessageUseCase } from './usecases/offer/sendOfferMessage.usecase';
import { ListParticipatingQuotationsUseCase } from './usecases/openQuotation/listParticipatingQuotations.usecase';
import { GetQuotationOfferUseCase } from './usecases/offer/getQuotationOffer.usecase';
import { ListCustomerOpenQuotationsUseCase } from './usecases/quotation/listCutomerOpenQuotations.usecase';
import { UpdateQuotationOfferUseCase } from './usecases/offer/updateQuotationOffer.usecase';
import { UpdateOpenQuotationUseCase } from './usecases/openQuotation/updateOpenQuotation.usecase';
import { QuotationEnrichmentService } from './domain/services/quotationEnrichment.service';
import { ListOpenQuotationsUseCase } from './usecases/openQuotation/listOpenQuotations.usecase';
import { EventActionEngineService } from './domain/services';

// Imports for Cancellation Penalty System
import { CancellationPenalty } from './infrastructure/entities/cancellationPenalty.entity';
import { CancellationPenaltyRepository } from './infrastructure/repositories/cancellationPenalty.repository';
import { PenaltyCalculationService } from './domain/services/penaltyCalculation.service';
import { CancelEventAndApplyPenaltyUseCase } from './usecases/event/cancelEventAndApplyPenalty.usecase';
import { PenaltyQueuesModule } from '../queues/penalty/penaltyQueues.module';
import { EventStateMachineService } from './domain/services/eventStateMachine.service';
import { SendEventMessageUseCase } from './usecases/event/sendEventMessage.usecase';
import { GetEventMessagesUseCase } from './usecases/event/getEventMessages.usecase';
import { SignedConsentRepository } from '../consent-module/infrastructure/repositories/signed-consent.repository';
import { ConsentModule } from '../consent-module/consent.module';
import { GetCustomerAppointmentsViewUseCase } from './usecases/event/getCustomerAppointmentsView.usecase';

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
    PenaltyQueuesModule,
    LocationRepositoryModule,
    TattooGeneratorDatabaseModule,
    ConsentModule,
    forwardRef(() => SyncQueueModule),
    TypeOrmModule.forFeature([
        AgendaUnavailableTime, 
        CancellationPenalty
    ], AGENDA_DB_CONNECTION_NAME),
  ],
  providers: [
    QuotationEnrichmentService,
    QuotationStateMachine,
    AgendaHandler,
    AddEventUseCase,
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
    CreateAgendaEventService,
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
    SendOfferMessageUseCase,
    ListParticipatingQuotationsUseCase,
    GetQuotationOfferUseCase,
    ListCustomerOpenQuotationsUseCase,
    UpdateQuotationOfferUseCase,
    UpdateOpenQuotationUseCase,
    EventActionEngineService,

    // Providers for Cancellation Penalty System
    CancellationPenaltyRepository,
    PenaltyCalculationService,
    CancelEventAndApplyPenaltyUseCase,
    EventStateMachineService,
    SendEventMessageUseCase,
    GetEventMessagesUseCase,
    GetCustomerAppointmentsViewUseCase,
  ],
  controllers: [AgendaController, QuotationController],
  exports: [
    CreateAgendaEventService,
  ]
})
export class AgendaModule {}