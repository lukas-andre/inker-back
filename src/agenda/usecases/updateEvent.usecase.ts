import { Injectable, Logger } from '@nestjs/common';
import { DomainException } from '../../global/domain/exceptions/domain.exception';
import { DomainNotFoundException } from '../../global/domain/exceptions/domainNotFound.exception';
import { AgendaService } from '../domain/agenda.service';
import { AgendaEventService } from '../domain/agendaEvent.service';
import { DomainConflictException } from '../../global/domain/exceptions/domainConflict.exception';
import { AgendaEvent } from '../intrastructure/entities/agendaEvent.entity';
import { DomainInternalServerErrorException } from '../../global/domain/exceptions/domainInternalServerError.exception';
import { UpdateEventReqDto } from '../intrastructure/dtos/updateEventReq.dto';

@Injectable()
export class UpdateEventUseCase {
  private readonly logger = new Logger(UpdateEventUseCase.name);

  constructor(
    private readonly agendaService: AgendaService,
    private readonly agendaEventService: AgendaEventService,
  ) {}

  async execute(
    updateEventReqDto: UpdateEventReqDto,
    eventId: string,
  ): Promise<AgendaEvent | DomainException> {
    console.log('updateEventReqDto: ', updateEventReqDto);
    console.log('eventId: ', eventId);
    const existsAgenda = await this.agendaService.findById(
      updateEventReqDto.agendaId,
    );

    if (!existsAgenda) {
      return new DomainNotFoundException('Agenda not found');
    }

    const event = await this.agendaEventService.findById(eventId);

    console.log('event: ', event);

    if (!event) {
      return new DomainNotFoundException('Event not found');
    }

    const [startDateIsInUse, endDateIsInUse] = await Promise.all([
      this.agendaEventService.existEventBetweenStartDateAndEndDate(
        existsAgenda.id,
        updateEventReqDto.start,
        event.id,
      ),
      this.agendaEventService.existEventBetweenStartDateAndEndDate(
        existsAgenda.id,
        updateEventReqDto.end,
        event.id,
      ),
    ]);

    if ([startDateIsInUse, endDateIsInUse].some(date => date === true)) {
      return new DomainConflictException(
        'Already exists event in current date range',
      );
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

    try {
      return this.agendaEventService.save(event);
    } catch (error) {
      this.logger.log(`Adding event error ${error.message}`);
      return new DomainInternalServerErrorException('Failed saving event');
    }
  }
}
