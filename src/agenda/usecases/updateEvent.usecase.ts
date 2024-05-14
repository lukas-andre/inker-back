import { Injectable } from '@nestjs/common';

import {
  DomainConflict,
  DomainNotFound,
} from '../../global/domain/exceptions/domain.exception';
import { BaseUseCase } from '../../global/domain/usecases/base.usecase';
import { UpdateEventReqDto } from '../infrastructure/dtos/updateEventReq.dto';
import { AgendaEvent } from '../infrastructure/entities/agendaEvent.entity';
import { AgendaProvider } from '../infrastructure/providers/agenda.provider';
import { AgendaEventProvider } from '../infrastructure/providers/agendaEvent.provider';

@Injectable()
export class UpdateEventUseCase extends BaseUseCase {
  constructor(
    private readonly agendaProvider: AgendaProvider,
    private readonly agendaEventProvider: AgendaEventProvider,
  ) {
    super(UpdateEventUseCase.name);
  }

  async execute(
    updateEventReqDto: UpdateEventReqDto,
    eventId: number,
  ): Promise<AgendaEvent> {
    const existsAgenda = await this.agendaProvider.findById(
      updateEventReqDto.agendaId,
    );

    if (!existsAgenda) {
      throw new DomainNotFound('Agenda not found');
    }

    const event = await this.agendaEventProvider.findById(eventId);

    if (!event) {
      throw new DomainNotFound('Event not found');
    }

    const dateRangeIsInUse =
      await this.agendaEventProvider.existEventBetweenStartDateAndEndDate(
        existsAgenda.id,
        updateEventReqDto.start,
        updateEventReqDto.end,
        event.id,
      );

    if (dateRangeIsInUse) {
      throw new DomainConflict('Already exists event in current date range');
    }

    await this.agendaEventProvider.createEventHistoryWithNativeQuery(
      event.id,
      event,
      existsAgenda.artistId,
    );

    event.title = updateEventReqDto.title || event.title;
    event.info = updateEventReqDto.info || event.info;
    event.color = updateEventReqDto.color || event.color;
    event.end = new Date(updateEventReqDto.end) || event.end;
    event.start = new Date(updateEventReqDto.start) || event.start;
    event.notification =
      typeof updateEventReqDto.notification === 'boolean'
        ? updateEventReqDto.notification
        : event.notification;

    return await this.agendaEventProvider.save(event);
  }
}
