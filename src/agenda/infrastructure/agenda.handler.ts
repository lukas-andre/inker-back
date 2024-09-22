import { Injectable, UnauthorizedException } from '@nestjs/common';

import { RequestContextService } from '../../global/infrastructure/services/requestContext.service';
import { FileInterface } from '../../multimedias/interfaces/file.interface';
import { AddEventUseCase } from '../usecases/addEvent.usecase';
import { CancelEventUseCase } from '../usecases/cancelEvent.usecase';
import { CreateQuotationUseCase } from '../usecases/createQuotation.usecase';
import { FindEventFromArtistByEventIdUseCase } from '../usecases/findEventFromArtistByEventId.usecase';
import { GetQuotationUseCase } from '../usecases/getQuotation.usecase';
import { GetQuotationsUseCase } from '../usecases/getQuotations.usecase';
import { GetWorkEvidenceByArtistIdUseCase } from '../usecases/getWorkEvidenceByArtistId.usecase';
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
import { CreateQuotationReqDto } from './dtos/createQuotationReq.dto';
import { CustomerQuotationActionDto } from './dtos/customerQuotationAction.dto';
import { QuotationDto } from './dtos/getQuotationRes.dto';
import { GetQuotationsQueryDto } from './dtos/getQuotationsQuery.dto';
import { GetWorkEvidenceByArtistIdResponseDto } from './dtos/getWorkEvidenceByArtistIdResponse.dto';
import { ListEventByViewTypeQueryDto } from './dtos/listEventByViewTypeQuery.dto';
import { UpdateEventReqDto } from './dtos/updateEventReq.dto';

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
    private readonly requestContex: RequestContextService,
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
    const { isNotArtist, userTypeId } = this.requestContex;
    if (isNotArtist) {
      throw new UnauthorizedException(
        'You dont have permission to access this resource',
      );
    }

    return this.listEventFromArtistAgenda.execute(userTypeId);
  }

  async handleGetEventByEventId(eventId: number): Promise<any> {
    const { isNotArtist, userTypeId } = this.requestContex;
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
    const { userTypeId } = this.requestContex;
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
    const { userTypeId } = this.requestContex;
    return this.rsvpUseCase.execute(userTypeId, agendaId, eventId, willAttend);
  }

  async createQuotation(
    dto: CreateQuotationReqDto,
    referenceImages: FileInterface[],
  ): Promise<any> {
    const { isNotCustomer, userTypeId } = this.requestContex;
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
    const { userType, userTypeId } = this.requestContex;
    return this.getQuotationsUseCase.execute(query, userType, userTypeId);
  }

  async processArtistAction(
    quotationId: number,
    artistQuoteDto: ArtistQuotationActionDto,
    proposedDesigns: FileInterface[],
  ): Promise<{ message: string; updated: boolean }> {
    const { isNotArtist, userId } = this.requestContex;
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
    const { isNotCustomer, userId } = this.requestContex;
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
}
