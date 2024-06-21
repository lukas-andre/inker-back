import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClsService } from 'nestjs-cls';

import { BaseHandler } from '../../global/infrastructure/base.handler';
import { InkerClsStore } from '../../global/infrastructure/guards/auth.guard';
import { RequestService } from '../../global/infrastructure/services/request.service';
import { FileInterface } from '../../multimedias/interfaces/file.interface';
import { UserType } from '../../users/domain/enums/userType.enum';
import { AddEventUseCase } from '../usecases/addEvent.usecase';
import { CancelEventUseCase } from '../usecases/cancelEvent.usecase';
import { CreateQuotationUseCase } from '../usecases/createQuotation.usecase';
import { FindEventFromArtistByEventIdUseCase } from '../usecases/findEventFromArtistByEventId.usecase';
import { GetWorkEvidenceByArtistIdUseCase } from '../usecases/getWorkEvidenceByArtistId.usecase';
import { ListEventByViewTypeUseCase } from '../usecases/listEventByViewType.usecase';
import { ListEventFromArtistAgenda } from '../usecases/listEventFromArtistAgenda.usecase';
import { MarkEventAsDoneUseCase } from '../usecases/markEventAsDone.usecase';
import { ReplyQuotationUseCase } from '../usecases/replyQuotation.usecase';
import { RsvpUseCase } from '../usecases/rsvp.usecase';
import { UpdateEventUseCase } from '../usecases/updateEvent.usecase';

import { AddEventReqDto } from './dtos/addEventReq.dto';
import { CreateQuotationReqDto } from './dtos/createQuotationReq.dto';
import { GetWorkEvidenceByArtistIdResponseDto } from './dtos/getWorkEvidenceByArtistIdResponse.dto';
import { ListEventByViewTypeQueryDto } from './dtos/listEventByViewTypeQuery.dto';
import { ReplyQuotationReqDto } from './dtos/replyQuotationReq.dto';
import { UpdateEventReqDto } from './dtos/updateEventReq.dto';

type RSVPType = {
  agendaId: number;
  eventId: number;
  willAttend: boolean;
};

@Injectable()
export class AgendaHandler extends BaseHandler {
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
    private readonly replyQuotationUseCase: ReplyQuotationUseCase,
    private readonly requestService: RequestService,
    private readonly jwtService: JwtService,
    private readonly rsvpUseCase: RsvpUseCase,
    private readonly clsService: ClsService<InkerClsStore>,
  ) {
    super(jwtService);
  }

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
    const jwt = this.clsService.get('jwt');
    if (jwt.userType !== UserType.ARTIST) {
      throw new UnauthorizedException(
        'You dont have permission to access this resource',
      );
    }

    return this.listEventFromArtistAgenda.execute(jwt.userTypeId);
  }

  async handleGetEventByEventId(eventId: number): Promise<any> {
    const jwt = this.clsService.get('jwt');
    if (jwt.userType !== UserType.ARTIST) {
      throw new UnauthorizedException(
        'You dont have permission to access this resource',
      );
    }
    return this.findEventByAgendaIdAndEventIdUseCase.execute(
      jwt.userTypeId,
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
    return this.getWorkEvidenceByArtistIdUseCase.execute(
      artistId,
      page,
      limit,
      this.requestService.userTypeId,
    );
  }

  handleRsvp(agendaId: number, eventId: number, willAttend: boolean): any {
    // it's suposed to just the customer is able to RSVP
    return this.rsvpUseCase.execute(
      this.clsService.get('jwt.userTypeId'),
      agendaId,
      eventId,
      willAttend,
    );
  }

  createQuotation(
    dto: CreateQuotationReqDto,
    referenceImages: FileInterface[],
  ): any {
    if (this.clsService.get('jwt.userType') !== UserType.CUSTOMER) {
      throw new UnauthorizedException(
        'You dont have permission to access this resource',
      );
    }

    return this.createQuotationUseCase.execute(dto, referenceImages);
  }

  replyQuotation(
    dto: ReplyQuotationReqDto,
    proposedImages: FileInterface[],
  ): any {
    if (this.clsService.get('jwt.userType') !== UserType.CUSTOMER) {
      throw new UnauthorizedException(
        'You dont have permission to access this resource',
      );
    }

    return this.replyQuotationUseCase.execute(dto, proposedImages);
  }
}
