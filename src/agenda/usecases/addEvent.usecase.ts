import { Injectable } from '@nestjs/common';
import { DomainException } from '../../global/domain/exceptions/domain.exception';
import { DomainNotFoundException } from '../../global/domain/exceptions/domainNotFound.exception';
import { AgendaService } from '../domain/agenda.service';
import { AgendaEventService } from '../domain/agendaEvent.service';
import { AddEventReqDto } from '../intrastructure/dtos/addEventReq.dto';
import { startOfDay, endOfDay } from 'date-fns';
import { Between, Equal } from 'typeorm';
import { DomainConflictException } from 'src/global/domain/exceptions/domainConflict.exception';

@Injectable()
export class AddEventUseCase {
  constructor(
    private readonly agendaService: AgendaService,
    private readonly agendaEventService: AgendaEventService,
  ) {}

  async execute(addEventDto: AddEventReqDto): Promise<null | DomainException> {
    let result: null | DomainException = null;
    const existsAgenda = await this.agendaService.findById(
      addEventDto.agendaId,
    );

    if (existsAgenda) {
      result = new DomainNotFoundException('Agenda not found');
    }

    const existingEvent = await this.agendaEventService.find({
      where: {
        start: Between(
          startOfDay(addEventDto.start).toISOString(),
          endOfDay(addEventDto.end).toISOString(),
        ),
        end: Between(
          startOfDay(addEventDto.start).toISOString(),
          endOfDay(addEventDto.end).toISOString(),
        ),
      },
    });

    console.log('existingEvent: ', existingEvent);

    if (existingEvent) {
      result = new DomainConflictException(
        'Already exists event in current date range',
      );
    }

    return;
  }
}
