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

import { AddEventReqDto } from './dtos/addEventReq.dto';
import { ArtistQuotationActionDto } from './dtos/artistQuotationAction.dto';
import { ChangeEventStatusReqDto } from './dtos/changeEventStatusReq.dto';
import { CreateQuotationReqDto } from './dtos/createQuotationReq.dto';
import { CustomerQuotationActionDto } from './dtos/customerQuotationAction.dto';
import { QuotationDto } from './dtos/getQuotationRes.dto';
import { GetQuotationsQueryDto } from './dtos/getQuotationsQuery.dto';
import { GetWorkEvidenceByArtistIdResponseDto } from './dtos/getWorkEvidenceByArtistIdResponse.dto';
import { ListEventByViewTypeQueryDto } from './dtos/listEventByViewTypeQuery.dto';
import { UpdateEventReqDto } from './dtos/updateEventReq.dto';
import { MarkQuotationAsReadUseCase } from '../usecases/quotation/markQuotationAsRead.usecase';

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
  ) {}

  async handleAddEvent(dto: AddEventReqDto): Promise<any> {
    return this.addEventUseCase.execute(dto);
  }

  async handleUpdateEvent(dto: UpdateEventReqDto, id: number): Promise<any> {
    return this.updateEventUseCase.execute(dto, id);
  }

  async handleCancelEvent(eventId: number, agendaId: number): Promise<any> {
    return this.cancelEventUseCase.execute(eventId, agendaId);
  }

  async handleListEventByViewType(
    agendaId: number,
    query: ListEventByViewTypeQueryDto,
  ): Promise<any> {
    return this.listEventByViewTypeUseCase.execute(agendaId, query);
  }

  async handleListEventFromArtistAgenda(): Promise<any> {
    const { userType, userTypeId } = this.requestContext;

    return this.listEventFromArtistAgenda.execute(userTypeId, userType);
  }

  async handleGetEventByEventId(eventId: number): Promise<any> {
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
  
  async handleGetCustomerEventByEventId(eventId: number): Promise<any> {
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
    eventId: number,
    agendaId: number,
    workEvidenceFiles: FileInterface[],
  ): Promise<any> {
    return this.markEventAsDoneUseCase.execute(
      eventId,
      agendaId,
      workEvidenceFiles,
    );
  }

  async handleGetWorkEvidenceByArtistId(
    artistId: number,
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
    agendaId: number,
    eventId: number,
    willAttend: boolean,
  ): Promise<any> {
    // it's suposed to just the customer is able to RSVP
    const { userTypeId } = this.requestContext;
    return this.rsvpUseCase.execute(userTypeId, agendaId, eventId, willAttend);
  }

  async createQuotation(
    dto: CreateQuotationReqDto,
    referenceImages: FileInterface[],
  ): Promise<any> {
    const { isNotCustomer, userTypeId } = this.requestContext;
    if (isNotCustomer) {
      throw new UnauthorizedException(
        'You dont have permission to access this resource',
      );
    }

    return this.createQuotationUseCase.execute(
      {
        ...dto,
        customerId: userTypeId,
      },
      referenceImages,
    );
  }

  async getQuotation(id: number): Promise<Partial<QuotationDto>> {
    return this.getQuotationUseCase.execute(id);
  }

  async getQuotations(query: GetQuotationsQueryDto): Promise<any> {
    const { userType, userTypeId } = this.requestContext;
    return this.getQuotationsUseCase.execute(query, userType, userTypeId);
  }

  async processArtistAction(
    quotationId: number,
    artistQuoteDto: ArtistQuotationActionDto,
    proposedDesigns: FileInterface[],
  ): Promise<{ message: string; updated: boolean }> {
    const { isNotArtist, userId } = this.requestContext;
    if (isNotArtist) {
      throw new UnauthorizedException(
        'You do not have permission to send a quotation',
      );
    }

    return this.artistSendQuotationUseCase.execute(
      userId,
      quotationId,
      artistQuoteDto,
      proposedDesigns,
    );
  }

  async processCustomerAction(
    quotationId: number,
    customerActionDto: CustomerQuotationActionDto,
  ) {
    const { isNotCustomer, userId } = this.requestContext;
    if (isNotCustomer) {
      throw new UnauthorizedException(
        'You do not have permission to perform this action',
      );
    }

    return this.customerQuotationActionUseCase.execute(
      userId,
      quotationId,
      customerActionDto,
    );
  }

  async handleListEventsByAgendaId(artistId: number) {
    return await this.listEventsbyArtistId.execute(artistId);
  }

  async markQuotationAsRead(id: number) {
    const { userType } = this.requestContext;
    return this.markQuotationAsReadUseCase.execute(id, userType);
  }

  async handleChangeEventStatus(
    agendaId: number,
    eventId: number,
    dto: ChangeEventStatusReqDto,
  ): Promise<void> {
    return this.changeEventStatusUsecase.execute(agendaId, eventId, dto);
  }

  async handleReviewEvent(
    agendaId: number,
    eventId: number,
    reviewData: ReviewArtistRequestDto,
  ): Promise<any> {
    return this.eventReviewIntegrationUsecase.execute(agendaId, eventId, reviewData);
  }
}
