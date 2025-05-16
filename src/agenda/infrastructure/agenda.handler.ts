import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { RequestContextService } from '../../global/infrastructure/services/requestContext.service';
import { FileInterface } from '../../multimedias/interfaces/file.interface';
import { ReviewArtistRequestDto } from '../../reviews/dtos/reviewArtistRequest.dto';
import { AddEventUseCase } from '../usecases/event/addEvent.usecase';
import { CancelEventAndApplyPenaltyUseCase } from '../usecases/agenda/cancelEventAndApplyPenalty.usecase';
import { ChangeEventStatusUsecase } from '../usecases/event/changeEventStatus.usecase';
import { CreateQuotationUseCase } from '../usecases/quotation/createQuotation.usecase';
import { FindEventFromArtistByEventIdUseCase } from '../usecases/agenda/findEventFromArtistByEventId.usecase';
import { GetQuotationUseCase } from '../usecases/quotation/getQuotation.usecase';
import { GetQuotationsUseCase } from '../usecases/quotation/getQuotations.usecase';
import { GetWorkEvidenceByArtistIdUseCase } from '../usecases/getWorkEvidenceByArtistId.usecase';
import { EventReviewIntegrationUsecase } from '../usecases/event/eventReviewIntegration.usecase';
import { ListEventByViewTypeUseCase } from '../usecases/event/listEventByViewType.usecase';
import { ListEventFromArtistAgenda } from '../usecases/event/listEventFromArtistAgenda.usecase';
import { ListEventsByArtistId } from '../usecases/event/listEventsByArtistId.usecase';
import { MarkEventAsDoneUseCase } from '../usecases/event/markEventAsDone.usecase';
import { ProcessArtistActionUseCase } from '../usecases/quotation/processArtistAction.usecase';
import { ProcessCustomerActionUseCase } from '../usecases/quotation/processCustomerAction.usecase';
import { RsvpUseCase } from '../usecases/event/rsvp.usecase';
import { UpdateEventUseCase } from '../usecases/event/updateEvent.usecase';
import { MarkQuotationAsReadUseCase } from '../usecases/quotation/markQuotationAsRead.usecase';

// New imports for Artist Workflow Improvements
import { UpdateAgendaSettingsUseCase } from '../usecases/agenda/updateAgendaSettings.usecase';
import { SetWorkingHoursUseCase } from '../usecases/agenda/setWorkingHours.usecase';
import { CreateUnavailableTimeUseCase } from '../usecases/agenda/createUnavailableTime.usecase';
import { GetUnavailableTimesUseCase } from '../usecases/agenda/getUnavailableTimes.usecase';
import { DeleteUnavailableTimeUseCase } from '../usecases/agenda/deleteUnavailableTime.usecase';
import { RescheduleEventUseCase } from '../usecases/event/rescheduleEvent.usecase';
import { UpdateEventNotesUseCase } from '../usecases/event/updateEventNotes.usecase';
import { GetArtistAvailabilityUseCase } from '../usecases/agenda/getArtistAvailability.usecase';
import { GetSuggestedTimeSlotsUseCase } from '../usecases/agenda/getSuggestedTimeSlots.usecase';
import { SchedulingService, AvailabilityCalendar, TimeSlot } from '../services/scheduling.service';
import { AgendaUnavailableTime } from './entities/agendaUnavailableTime.entity';

// DTOs
import { AddEventReqDto } from './dtos/addEventReq.dto';
import { ArtistQuotationActionDto } from './dtos/artistQuotationAction.dto';
import { ChangeEventStatusReqDto } from './dtos/changeEventStatusReq.dto';
import { CreateQuotationReqDto } from './dtos/createQuotationReq.dto';
import { CustomerQuotationActionDto } from './dtos/customerQuotationAction.dto';
import { GetQuotationResDto } from './dtos/getQuotationRes.dto';
import { GetQuotationsQueryDto } from './dtos/getQuotationsQuery.dto';
import { GetWorkEvidenceByArtistIdResponseDto } from './dtos/getWorkEvidenceByArtistIdResponse.dto';
import { ListEventByViewTypeQueryDto } from './dtos/listEventByViewTypeQuery.dto';
import { UpdateEventReqDto } from './dtos/updateEventReq.dto';
import { SetWorkingHoursReqDto } from './dtos/setWorkingHoursReq.dto';
import { CreateUnavailableTimeReqDto } from './dtos/createUnavailableTimeReq.dto';
import { RescheduleEventReqDto } from './dtos/rescheduleEventReq.dto';
import { UpdateEventNotesReqDto } from './dtos/updateEventNotesReq.dto';
import { ArtistAvailabilityQueryDto } from './dtos/artistAvailabilityQuery.dto';
import { UpdateAgendaSettingsReqDto } from './dtos/updateAgendaSettingsReq.dto';
import { GetAgendaSettingsResDto } from './dtos/getAgendaSettingsRes.dto';
import { GetAgendaSettingsUseCase } from '../usecases/agenda/getAgendaSettings.usecase';

// New Use Case Imports for Open Quotations
import { SubmitQuotationOfferUseCase } from '../usecases/offer/submitQuotationOffer.usecase';
import { ListQuotationOffersUseCase } from '../usecases/offer/listQuotationOffers.usecase';
import { AcceptQuotationOfferUseCase } from '../usecases/offer/acceptQuotationOffer.usecase';

// New DTO Imports for Open Quotations
import { ListOpenQuotationsQueryDto, GetOpenQuotationsResDto } from './dtos/listOpenQuotationsQuery.dto';
import { CreateQuotationOfferReqDto } from './dtos/createQuotationOfferReq.dto';
import { ListQuotationOffersResDto } from './dtos/listQuotationOffersRes.dto';
import { UserType as RequestContextUserType } from '../../users/domain/enums/userType.enum';
import { UserType as ActionEngineUserType } from '../domain/services/eventActionEngine.service';

// Import necessary types for the new method
import { SendOfferMessageUseCase } from '../usecases/offer/sendOfferMessage.usecase';
import { SendOfferMessageReqDto } from './dtos/sendOfferMessageReq.dto';
import { OfferMessageDto } from '../domain/dtos/offerMessage.dto';

// Import the new use case and DTO
import { ListParticipatingQuotationsUseCase } from '../usecases/openQuotation/listParticipatingQuotations.usecase';
import { ListParticipatingQuotationsResDto } from '../domain/dtos/participatingQuotationOffer.dto';
// Import the GetQuotationOfferUseCase
import { GetQuotationOfferUseCase } from '../usecases/offer/getQuotationOffer.usecase';
import { ParticipatingQuotationOfferDto } from '../domain/dtos/participatingQuotationOffer.dto';
import { ListCustomerOpenQuotationsUseCase } from '../usecases/quotation/listCutomerOpenQuotations.usecase';
// Import the UpdateQuotationOfferUseCase and DTO
import { UpdateQuotationOfferReqDto } from './dtos/updateQuotationOfferReq.dto';
import { UpdateQuotationOfferUseCase } from '../usecases/offer/updateQuotationOffer.usecase';
// Potentially import Query DTO if pagination is implemented
// import { ListParticipatingQuotationsQueryDto } from './dtos/listParticipatingQuotationsQuery.dto';
import { UpdateOpenQuotationReqDto } from './dtos/updateOpenQuotationReq.dto';
import { UpdateOpenQuotationUseCase } from '../usecases/openQuotation/updateOpenQuotation.usecase';
import { ListOpenQuotationsUseCase } from '../usecases/openQuotation/listOpenQuotations.usecase';
import { EventActionsResultDto } from '../domain/dtos/eventActionsResult.dto';

@Injectable()
export class AgendaHandler {
  private readonly logger = new Logger(AgendaHandler.name);

  constructor(
    private readonly addEventUseCase: AddEventUseCase,
    // private readonly updateEventUseCase: UpdateEventUseCase,
    private readonly cancelEventAndApplyPenaltyUseCase: CancelEventAndApplyPenaltyUseCase,
    private readonly listEventByViewTypeUseCase: ListEventByViewTypeUseCase,
    private readonly findEventByAgendaIdAndEventIdUseCase: FindEventFromArtistByEventIdUseCase,
    private readonly markEventAsDoneUseCase: MarkEventAsDoneUseCase,
    private readonly getWorkEvidenceByArtistIdUseCase: GetWorkEvidenceByArtistIdUseCase,
    private readonly listEventFromArtistAgenda: ListEventFromArtistAgenda,
    private readonly createQuotationUseCase: CreateQuotationUseCase,
    private readonly getQuotationUseCase: GetQuotationUseCase,
    private readonly getQuotationsUseCase: GetQuotationsUseCase,
    private readonly artistSendQuotationUseCase: ProcessArtistActionUseCase,
    private readonly customerQuotationActionUseCase: ProcessCustomerActionUseCase,
    private readonly listEventsbyArtistId: ListEventsByArtistId,
    private readonly rsvpUseCase: RsvpUseCase,
    private readonly requestContext: RequestContextService,
    private readonly markQuotationAsReadUseCase: MarkQuotationAsReadUseCase,
    private readonly changeEventStatusUsecase: ChangeEventStatusUsecase,
    private readonly eventReviewIntegrationUsecase: EventReviewIntegrationUsecase,
    // New dependencies for Artist Workflow Improvements
    private readonly setWorkingHoursUseCase: SetWorkingHoursUseCase,
    private readonly createUnavailableTimeUseCase: CreateUnavailableTimeUseCase,
    private readonly getUnavailableTimesUseCase: GetUnavailableTimesUseCase,
    private readonly deleteUnavailableTimeUseCase: DeleteUnavailableTimeUseCase,
    private readonly rescheduleEventUseCase: RescheduleEventUseCase,
    private readonly updateEventNotesUseCase: UpdateEventNotesUseCase,
    private readonly getArtistAvailabilityUseCase: GetArtistAvailabilityUseCase,
    private readonly getSuggestedTimeSlotsUseCase: GetSuggestedTimeSlotsUseCase,
    private readonly updateAgendaSettingsUseCase: UpdateAgendaSettingsUseCase,
    private readonly getAgendaSettingsUseCase: GetAgendaSettingsUseCase,
    // New Open Quotation Use Cases
    private readonly listOpenQuotationsUseCase: ListOpenQuotationsUseCase,
    private readonly submitQuotationOfferUseCase: SubmitQuotationOfferUseCase,
    private readonly listQuotationOffersUseCase: ListQuotationOffersUseCase,
    private readonly acceptQuotationOfferUseCase: AcceptQuotationOfferUseCase,
    // Inject the new use case
    private readonly sendOfferMessageUseCase: SendOfferMessageUseCase,
    // Inject the new use case
    private readonly listParticipatingQuotationsUseCase: ListParticipatingQuotationsUseCase,
    // Inject the new use case for getting a single offer
    private readonly getQuotationOfferUseCase: GetQuotationOfferUseCase,
    private readonly listCustomerOpenQuotationsUseCase: ListCustomerOpenQuotationsUseCase,
    // Inject the new use case for updating quotation offer
    private readonly updateQuotationOfferUseCase: UpdateQuotationOfferUseCase,
    // Nuevo usecase para actualizar cotización abierta
    private readonly updateOpenQuotationUseCase: UpdateOpenQuotationUseCase,
  ) { }

  async handleAddEvent(dto: AddEventReqDto): Promise<any> {
    return this.addEventUseCase.execute(dto);
  }

  async handleUpdateEvent(dto: UpdateEventReqDto, id: string): Promise<any> {
    // return this.updateEventUseCase.execute(dto, id);
  }

  async handleCancelEvent(eventId: string, agendaId: string, reason: string): Promise<any> {
    const { userTypeId, userType: contextUserType } = this.requestContext;

    let mappedUserType: ActionEngineUserType;
    if (contextUserType === RequestContextUserType.ARTIST) {
      mappedUserType = 'artist';
    } else if (contextUserType === RequestContextUserType.CUSTOMER) {
      mappedUserType = 'customer';
    } else {
      this.logger.error(`User type ${contextUserType} from request context is not supported for direct event cancellation with penalty.`);
      throw new BadRequestException('Admins or other user types cannot directly cancel events through this flow. Please use an appropriate administrative tool or cancel on behalf of a user.');
    }

    return this.cancelEventAndApplyPenaltyUseCase.execute(
      eventId,
      userTypeId,
      mappedUserType,
      reason,
    );
  }

  async handleListEventByViewType(
    agendaId: string,
    query: ListEventByViewTypeQueryDto,
  ): Promise<any> {
    return this.listEventByViewTypeUseCase.execute(agendaId, query);
  }

  async handleListEventFromArtistAgenda(status?: string): Promise<any> {
    const { userType, userTypeId } = this.requestContext;
    return this.listEventFromArtistAgenda.execute(userTypeId, userType, status);
  }

  /**
   * Get event by eventId for artist
   * @returns { event, location, quotation, actions: EventActionsResultDto }
   */
  async handleGetEventByEventId(eventId: string): Promise<{
    event: any;
    location: any;
    quotation: any;
    actions: EventActionsResultDto;
  }> {
    const { isNotArtist, userTypeId } = this.requestContext;
    if (isNotArtist) {
      throw new UnauthorizedException(
        'You dont have permission to access this resource',
      );
    }
    return this.findEventByAgendaIdAndEventIdUseCase.execute(
      userTypeId,
      eventId,
    );
  }

  /**
   * Get event by eventId for customer
   * @returns { event, artist, location, quotation, actions: EventActionsResultDto }
   */
  async handleGetCustomerEventByEventId(eventId: string): Promise<{
    event: any;
    artist: any;
    location: any;
    quotation: any;
    actions: EventActionsResultDto;
  }> {
    const { isNotCustomer, userTypeId } = this.requestContext;
    if (isNotCustomer) {
      throw new UnauthorizedException(
        'You dont have permission to access this resource',
      );
    }
    return this.findEventByAgendaIdAndEventIdUseCase.executeForCustomer(
      userTypeId,
      eventId,
    );
  }

  async handleMarkEventAsDone(
    eventId: string,
    agendaId: string,
    workEvidenceFiles: FileInterface[],
  ): Promise<any> {
    return this.markEventAsDoneUseCase.execute(
      eventId,
      agendaId,
      workEvidenceFiles,
    );
  }

  async handleGetWorkEvidenceByArtistId(
    artistId: string,
    page: number,
    limit: number,
  ): Promise<GetWorkEvidenceByArtistIdResponseDto> {
    const { userTypeId } = this.requestContext;
    return this.getWorkEvidenceByArtistIdUseCase.execute(
      artistId,
      page,
      limit,
      userTypeId,
    );
  }

  async handleRsvp(
    agendaId: string,
    eventId: string,
    willAttend: boolean,
  ): Promise<any> {
    const { userTypeId } = this.requestContext;
    return this.rsvpUseCase.execute(userTypeId, agendaId, eventId, willAttend);
  }

  async createQuotation(
    dto: CreateQuotationReqDto,
    referenceImages: FileInterface[],
  ): Promise<any> {
    const { userTypeId } = this.requestContext;
    return this.createQuotationUseCase.execute(dto, userTypeId, referenceImages);
  }

  async getQuotation(id: string): Promise<GetQuotationResDto> {
    const { userType, userTypeId } = this.requestContext;
    // Pass artistId to usecase when user is an artist
    if (userType === RequestContextUserType.ARTIST) {
      return this.getQuotationUseCase.execute(id, userTypeId);
    }
    return this.getQuotationUseCase.execute(id);
  }

  async getQuotations(
    query: GetQuotationsQueryDto,
  ): Promise<{ items: GetQuotationResDto[]; total: number }> {
    const { userType, userTypeId } = this.requestContext;
    return this.getQuotationsUseCase.execute(query, userType, userTypeId);
  }

  async processArtistAction(
    quotationId: string,
    artistQuoteDto: ArtistQuotationActionDto,
    proposedDesigns: FileInterface[],
  ): Promise<{ message: string; updated: boolean }> {
    const { userTypeId, userType } = this.requestContext;
    if (userType !== RequestContextUserType.ARTIST) {
      throw new UnauthorizedException(
        'You dont have permission to access this resource',
      );
    }
    return this.artistSendQuotationUseCase.execute(
      userTypeId,
      quotationId,
      artistQuoteDto,
      proposedDesigns,
    );
  }

  async processCustomerAction(
    quotationId: string,
    customerActionDto: CustomerQuotationActionDto,
  ) {
    const { userTypeId, userType } = this.requestContext;
    if (userType !== RequestContextUserType.CUSTOMER) {
      throw new UnauthorizedException(
        'You dont have permission to access this resource',
      );
    }
    return this.customerQuotationActionUseCase.execute(
      userTypeId,
      quotationId,
      customerActionDto,
    );
  }

  async handleListEventsByAgendaId(artistId: string) {
    return await this.listEventsbyArtistId.execute(artistId);
  }

  async markQuotationAsRead(id: string) {
    const { userType } = this.requestContext;

    return this.markQuotationAsReadUseCase.execute(id, userType);
  }

  async handleChangeEventStatus(
    agendaId: string,
    eventId: string,
    dto: ChangeEventStatusReqDto,
  ): Promise<void> {
    return this.changeEventStatusUsecase.execute(agendaId, eventId, dto);
  }

  async handleReviewEvent(
    agendaId: string,
    eventId: string,
    reviewData: ReviewArtistRequestDto,
  ): Promise<any> {
    return this.eventReviewIntegrationUsecase.execute(agendaId, eventId, reviewData);
  }

  // New methods for Artist Workflow Improvements

  async handleSetWorkingHours(
    agendaId: string,
    dto: SetWorkingHoursReqDto,
  ): Promise<void> {
    return this.setWorkingHoursUseCase.execute(agendaId, dto);
  }

  async handleCreateUnavailableTime(
    agendaId: string,
    dto: CreateUnavailableTimeReqDto,
  ): Promise<AgendaUnavailableTime> {
    return this.createUnavailableTimeUseCase.execute(agendaId, dto);
  }

  async handleGetUnavailableTimes(agendaId: string): Promise<AgendaUnavailableTime[]> {
    return this.getUnavailableTimesUseCase.execute(agendaId);
  }

  async handleDeleteUnavailableTime(agendaId: string, id: string): Promise<void> {
    return this.deleteUnavailableTimeUseCase.execute(agendaId, id);
  }

  async handleRescheduleEvent(
    agendaId: string,
    eventId: string,
    dto: RescheduleEventReqDto,
  ): Promise<void> {
    const { userId } = this.requestContext;
    return this.rescheduleEventUseCase.execute(agendaId, eventId, dto, userId);
  }

  async handleUpdateEventNotes(
    agendaId: string,
    eventId: string,
    dto: UpdateEventNotesReqDto,
  ): Promise<void> {
    return this.updateEventNotesUseCase.execute(agendaId, eventId, dto);
  }

  async handleGetArtistAvailability(
    artistId: string,
    query: ArtistAvailabilityQueryDto,
  ): Promise<AvailabilityCalendar[]> {
    return this.getArtistAvailabilityUseCase.execute(artistId, query);
  }

  async handleGetSuggestedTimeSlots(quotationId: string): Promise<TimeSlot[]> {
    return this.getSuggestedTimeSlotsUseCase.execute(quotationId);
  }

  async handleGetAgendaSettings(agendaId: string): Promise<GetAgendaSettingsResDto> {
    return this.getAgendaSettingsUseCase.execute(agendaId);
  }

  async handleUpdateAgendaSettings(
    agendaId: string,
    dto: UpdateAgendaSettingsReqDto,
  ): Promise<void> {
    return this.updateAgendaSettingsUseCase.execute(agendaId, dto);
  }

  // New methods for Open Quotations

  async listOpenQuotations(
    query: ListOpenQuotationsQueryDto
  ): Promise<GetOpenQuotationsResDto> {
    const { userType, userTypeId } = this.requestContext;
    if (userType == RequestContextUserType.ARTIST) {
      return this.listOpenQuotationsUseCase.execute(userTypeId, query);
    }
    return this.listCustomerOpenQuotationsUseCase.execute(userTypeId, query);
  }

  async submitOffer(
    quotationId: string,
    dto: CreateQuotationOfferReqDto
  ): Promise<{ id: string; created: boolean }> {
    const { userTypeId, userType } = this.requestContext;
    if (userType !== RequestContextUserType.ARTIST) {
      throw new UnauthorizedException(
        'You dont have permission to access this resource',
      );
    }
    return this.submitQuotationOfferUseCase.execute(quotationId, userTypeId, dto);
  }

  async listOffers(
    quotationId: string,
  ): Promise<ListQuotationOffersResDto> {
    const { userTypeId, userType } = this.requestContext;
    if (userType !== RequestContextUserType.CUSTOMER) {
      throw new UnauthorizedException(
        'You dont have permission to access this resource',
      );
    }
    return this.listQuotationOffersUseCase.execute(quotationId, userTypeId);
  }

  async acceptOffer(
    quotationId: string,
    offerId: string,
  ): Promise<{ success: boolean; message: string }> {
    const { userTypeId, userType } = this.requestContext;
    if (userType !== RequestContextUserType.CUSTOMER) {
      throw new UnauthorizedException(
        'You dont have permission to access this resource',
      );
    }
    return this.acceptQuotationOfferUseCase.execute(quotationId, offerId, userTypeId);
  }

  // Add the new handler method
  async sendOfferMessage(
    quotationId: string,
    offerId: string,
    dto: SendOfferMessageReqDto,
    image?: FileInterface,
  ): Promise<OfferMessageDto> {
    // Implementation will call this.sendOfferMessageUseCase.execute
    // Needs mapping from the resulting OfferMessage entity to OfferMessageDto
    const resultMessageEntity = await this.sendOfferMessageUseCase.execute(
      quotationId,
      offerId,
      dto,
      image,
    );

    // Find the newly added message (usually the last one)
    const newMessage = resultMessageEntity.messages?.slice(-1)[0];

    if (!newMessage) {
      // Handle error case where message wasn't added or found
      // This shouldn't happen if the use case succeeded but good to check
      throw new Error('Failed to retrieve sent message');
    }

    // Map the OfferMessage entity to OfferMessageDto
    return {
      senderId: newMessage.senderId,
      senderType: newMessage.senderType,
      message: newMessage.message,
      imageUrl: newMessage.imageUrl,
      timestamp: newMessage.timestamp,
    };
  }

  // Add the new handler method for listing participating quotations
  async listParticipatingQuotations(
    // query?: ListParticipatingQuotationsQueryDto // Add query DTO if needed
  ): Promise<ListParticipatingQuotationsResDto> {
    const { userType, userTypeId } = this.requestContext;
    if (userType !== RequestContextUserType.ARTIST) {
      throw new UnauthorizedException(
        'Only artists can access this resource.',
      );
    }
    // Pass the artist ID and potentially the query DTO to the use case
    return this.listParticipatingQuotationsUseCase.execute(userTypeId /*, query */);
  }

  // Method to handle fetching a single quotation offer
  async getQuotationOffer(
    offerId: string,
  ): Promise<ParticipatingQuotationOfferDto> {
    const { userType, userTypeId } = this.requestContext;

    // Authorize access (only artist who created the offer or customer who received it)
    // For now, we'll just check if the user is an artist, the use case will check if it's their offer
    if (userType !== RequestContextUserType.ARTIST && userType !== RequestContextUserType.CUSTOMER) {
      throw new UnauthorizedException(
        'You do not have permission to access this resource',
      );
    }

    // If artist, pass their ID for authorization check
    const currentArtistId = userType === RequestContextUserType.ARTIST ? userTypeId : undefined;

    return this.getQuotationOfferUseCase.execute(offerId, currentArtistId);
  }

  // Method to handle updating a quotation offer
  async updateQuotationOffer(
    quotationId: string,
    offerId: string,
    dto: UpdateQuotationOfferReqDto,
  ): Promise<void> {
    const { userType, userTypeId } = this.requestContext;

    // Only artists can update their own offers
    if (userType !== RequestContextUserType.ARTIST) {
      throw new UnauthorizedException(
        'Only artists can update their quotation offers'
      );
    }

    return this.updateQuotationOfferUseCase.execute(quotationId, offerId, userTypeId, dto);
  }

  // Método para actualizar cotización abierta (customer)
  async updateOpenQuotation(
    quotationId: string,
    dto: UpdateOpenQuotationReqDto,
  ): Promise<void> {
    const { userType, userTypeId } = this.requestContext;
    if (userType !== RequestContextUserType.CUSTOMER) {
      throw new UnauthorizedException('Solo el customer puede actualizar su cotización abierta');
    }
    await this.updateOpenQuotationUseCase.execute(quotationId, userTypeId, dto);
  }
}