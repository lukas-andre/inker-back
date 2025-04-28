import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RequestContextService } from '../../global/infrastructure/services/requestContext.service';
import { FileInterface } from '../../multimedias/interfaces/file.interface';
import { ReviewArtistRequestDto } from '../../reviews/dtos/reviewArtistRequest.dto';
import { AddEventUseCase } from '../usecases/addEvent.usecase';
import { CancelEventUseCase } from '../usecases/cancelEvent.usecase';
import { ChangeEventStatusUsecase } from '../usecases/changeEventStatus.usecase';
import { CreateQuotationUseCase } from '../usecases/createQuotation.usecase';
import { FindEventFromArtistByEventIdUseCase } from '../usecases/findEventFromArtistByEventId.usecase';
import { GetQuotationUseCase } from '../usecases/getQuotation.usecase';
import { GetQuotationsUseCase } from '../usecases/getQuotations.usecase';
import { GetWorkEvidenceByArtistIdUseCase } from '../usecases/getWorkEvidenceByArtistId.usecase';
import { EventReviewIntegrationUsecase } from '../usecases/integrations/eventReviewIntegration.usecase';
import { ListEventByViewTypeUseCase } from '../usecases/listEventByViewType.usecase';
import { ListEventFromArtistAgenda } from '../usecases/listEventFromArtistAgenda.usecase';
import { ListEventsByArtistId } from '../usecases/listEventsByArtistId.usecase';
import { MarkEventAsDoneUseCase } from '../usecases/markEventAsDone.usecase';
import { ProcessArtistActionUseCase } from '../usecases/quotation/processArtistAction.usecase';
import { ProcessCustomerActionUseCase } from '../usecases/quotation/processCustomerAction.usecase';
import { RsvpUseCase } from '../usecases/rsvp.usecase';
import { UpdateEventUseCase } from '../usecases/updateEvent.usecase';
import { MarkQuotationAsReadUseCase } from '../usecases/quotation/markQuotationAsRead.usecase';

// New imports for Artist Workflow Improvements
import { UpdateAgendaSettingsUseCase } from '../usecases/updateAgendaSettings.usecase';
import { SetWorkingHoursUseCase } from '../usecases/setWorkingHours.usecase';
import { CreateUnavailableTimeUseCase } from '../usecases/createUnavailableTime.usecase';
import { GetUnavailableTimesUseCase } from '../usecases/getUnavailableTimes.usecase';
import { DeleteUnavailableTimeUseCase } from '../usecases/deleteUnavailableTime.usecase';
import { RescheduleEventUseCase } from '../usecases/rescheduleEvent.usecase';
import { UpdateEventNotesUseCase } from '../usecases/updateEventNotes.usecase';
import { GetArtistAvailabilityUseCase } from '../usecases/getArtistAvailability.usecase';
import { GetSuggestedTimeSlotsUseCase } from '../usecases/getSuggestedTimeSlots.usecase';
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
import { GetAgendaSettingsUseCase } from '../usecases/getAgendaSettings.usecase';

// New Use Case Imports for Open Quotations
import { ListOpenQuotationsUseCase } from '../usecases/listOpenQuotations.usecase';
import { SubmitQuotationOfferUseCase } from '../usecases/submitQuotationOffer.usecase';
import { ListQuotationOffersUseCase } from '../usecases/listQuotationOffers.usecase';
import { AcceptQuotationOfferUseCase } from '../usecases/acceptQuotationOffer.usecase';

// New DTO Imports for Open Quotations
import { ListOpenQuotationsQueryDto, GetOpenQuotationsResDto } from './dtos/listOpenQuotationsQuery.dto';
import { CreateQuotationOfferReqDto } from './dtos/createQuotationOfferReq.dto';
import { ListQuotationOffersResDto } from './dtos/listQuotationOffersRes.dto';
import { UserType } from '../../users/domain/enums/userType.enum';

@Injectable()
export class AgendaHandler {
  constructor(
    private readonly addEventUseCase: AddEventUseCase,
    private readonly updateEventUseCase: UpdateEventUseCase,
    private readonly cancelEventUseCase: CancelEventUseCase,
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
  ) { }

  async handleAddEvent(dto: AddEventReqDto): Promise<any> {
    return this.addEventUseCase.execute(dto);
  }

  async handleUpdateEvent(dto: UpdateEventReqDto, id: string): Promise<any> {
    return this.updateEventUseCase.execute(dto, id);
  }

  async handleCancelEvent(eventId: string, agendaId: string): Promise<any> {
    return this.cancelEventUseCase.execute(eventId, agendaId);
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

  async handleGetEventByEventId(eventId: string): Promise<any> {
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

  async handleGetCustomerEventByEventId(eventId: string): Promise<any> {
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
    if (userType !== UserType.ARTIST) {
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
    if (userType !== UserType.CUSTOMER) {
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
    if (userType !== UserType.CUSTOMER) {
      throw new UnauthorizedException(
        'You dont have permission to access this resource',
      );
    }
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
    if (userType !== UserType.ARTIST) {
      throw new UnauthorizedException(
        'You dont have permission to access this resource',
      );
    }
    return this.listOpenQuotationsUseCase.execute(userTypeId, query);
  }

  async submitOffer(
    quotationId: string,
    dto: CreateQuotationOfferReqDto
  ): Promise<{ id: string; created: boolean }> {
    const { userTypeId, userType } = this.requestContext;
    if (userType !== UserType.ARTIST) {
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
    if (userType !== UserType.CUSTOMER) {
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
    if (userType !== UserType.CUSTOMER) {
      throw new UnauthorizedException(
        'You dont have permission to access this resource',
      );
    }
    return this.acceptQuotationOfferUseCase.execute(quotationId, offerId, userTypeId);
  }
}