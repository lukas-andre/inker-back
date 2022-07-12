import { Injectable } from '@nestjs/common';
import {
  DomainConflict,
  DomainNotFound,
} from '../../global/domain/exceptions/domain.exception';
import { BaseUseCase } from '../../global/domain/usecases/base.usecase';
import { AgendaService } from '../domain/agenda.service';
import { AgendaEventService } from '../domain/agendaEvent.service';
import { UpdateEventReqDto } from '../infrastructure/dtos/updateEventReq.dto';
import { AgendaEvent } from '../infrastructure/entities/agendaEvent.entity';

@Injectable()
export class UpdateEventUseCase extends BaseUseCase {
  constructor(
    private readonly agendaService: AgendaService,
    private readonly agendaEventService: AgendaEventService,
  ) {
    super(UpdateEventUseCase.name);
  }

  async execute(
    updateEventReqDto: UpdateEventReqDto,
    eventId: number,
  ): Promise<AgendaEvent> {
    const existsAgenda = await this.agendaService.findById(
      updateEventReqDto.agendaId,
    );

    if (!existsAgenda) {
      throw new DomainNotFound('Agenda not found');
    }

    const event = await this.agendaEventService.findById(eventId);

    if (!event) {
      throw new DomainNotFound('Event not found');
    }

    const dateRangeIsInUse =
      await this.agendaEventService.existEventBetweenStartDateAndEndDate(
        existsAgenda.id,
        updateEventReqDto.start,
        updateEventReqDto.end,
        event.id,
      );

    if (dateRangeIsInUse) {
      throw new DomainConflict('Already exists event in current date range');
    }

    event.title = updateEventReqDto.title
      ? updateEventReqDto.title
      : event.title;
    event.info = updateEventReqDto.info ? updateEventReqDto.info : event.info;
    event.color = updateEventReqDto.color
      ? updateEventReqDto.color
      : event.color;
    event.end = updateEventReqDto.end
      ? updateEventReqDto.end
      : (event.end as any);
    event.start = updateEventReqDto.start
      ? updateEventReqDto.start
      : (event.start as any);
    event.notification =
      typeof updateEventReqDto.notification === 'boolean'
        ? updateEventReqDto.notification
        : event.notification;

    return this.agendaEventService.save(event);
  }
}
