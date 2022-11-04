import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { BaseHandler } from '../../global/infrastructure/base.handler';
import { AddEventUseCase } from '../usecases/addEvent.usecase';
import { CancelEventUseCase } from '../usecases/cancelEvent.usecase';
import { FindEventByAgendaIdAndEventIdUseCase } from '../usecases/findEventByAgendaIdAndEventId.usecase';
import { ListEventByViewTypeUseCase } from '../usecases/listEventByViewType.usecase';
import { UpdateEventUseCase } from '../usecases/updateEvent.usecase';

import { AddEventReqDto } from './dtos/addEventReq.dto';
import { ListEventByViewTypeQueryDto } from './dtos/listEventByViewTypeQuery.dto';
import { UpdateEventReqDto } from './dtos/updateEventReq.dto';

@Injectable()
export class AgendaHandler extends BaseHandler {
  constructor(
    private readonly addEventUseCase: AddEventUseCase,
    private readonly updateEventUseCase: UpdateEventUseCase,
    private readonly cancelEventUseCase: CancelEventUseCase,
    private readonly listEventByViewTypeUseCase: ListEventByViewTypeUseCase,
    private readonly findEventByAgendaIdAndEventIdUseCase: FindEventByAgendaIdAndEventIdUseCase,
    private readonly jwtService: JwtService,
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

  async handleGetEventByEventId(
    agendaId: number,
    eventId: number,
  ): Promise<any> {
    return this.findEventByAgendaIdAndEventIdUseCase.execute(agendaId, eventId);
  }
}
