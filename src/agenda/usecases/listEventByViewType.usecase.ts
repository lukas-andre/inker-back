import { Injectable } from '@nestjs/common';
import { endOfWeek, format, startOfWeek } from 'date-fns';

import {
  DomainBadRequest,
  DomainNotFound,
} from '../../global/domain/exceptions/domain.exception';
import {
  BaseUseCase,
  UseCase,
} from '../../global/domain/usecases/base.usecase';
import { AgendaService } from '../domain/agenda.service';
import { AgendaEventService } from '../domain/agendaEvent.service';
import { AgendaViewType } from '../domain/enum/agendaViewType.enum';
import { ListEventByViewTypeQueryDto } from '../infrastructure/dtos/listEventByViewTypeQuery.dto';
import { Agenda } from '../infrastructure/entities/agenda.entity';
import { AgendaEvent } from '../infrastructure/entities/agendaEvent.entity';
@Injectable()
export class ListEventByViewTypeUseCase extends BaseUseCase implements UseCase {
  constructor(
    private readonly agendaService: AgendaService,
    private readonly agendaEventService: AgendaEventService,
  ) {
    super(ListEventByViewTypeUseCase.name);
  }

  async execute(
    agendaId: number,
    listEventByViewTypeQueryDto: ListEventByViewTypeQueryDto,
  ): Promise<AgendaEvent[]> {
    let result: AgendaEvent[];

    const existsAgenda = await this.agendaService.findById(agendaId);

    if (!existsAgenda) {
      throw new DomainNotFound('Agenda not found');
    }

    switch (listEventByViewTypeQueryDto.agendaViewType) {
      case AgendaViewType.DAY:
        result = await this.handleDayViewType(
          existsAgenda,
          listEventByViewTypeQueryDto.date,
        );
        break;

      case AgendaViewType.WEEK:
        result = await this.handleWeekViewType(
          existsAgenda,
          listEventByViewTypeQueryDto.date,
        );
        break;

      default:
        throw new DomainBadRequest('Invalid agenda view type');
    }
    return result;
  }

  private async handleDayViewType(
    agenda: Agenda,
    date: string,
  ): Promise<AgendaEvent[]> {
    // ESTA ES LA MANERA MAS POCO ELEGANTE DE CREAR EL INICIO Y EL FIN
    // DE UN DIA EN UNA DATE CON FORMATO yyyy-MM-dd
    const startOfDay = date + ' 00:00:00';
    const endOfDay = date + ' 23:59:59';

    const result = await this.agendaEventService.findByDateRange(
      agenda.id,
      startOfDay,
      endOfDay,
    );

    return result;
  }

  private async handleWeekViewType(
    agenda: Agenda,
    date: string,
  ): Promise<AgendaEvent[]> {
    const startOfAgendaWeek = startOfWeek(new Date(date), { weekStartsOn: 1 });
    const endOfAgendaWeek = endOfWeek(new Date(date), { weekStartsOn: 1 });

    const stringStartOfAgendaWeek = format(
      startOfAgendaWeek,
      'yyyy-MM-dd hh:mm:ss',
    );
    const stringEndOfAgendaWeek = format(
      endOfAgendaWeek,
      'yyyy-MM-dd hh:mm:ss',
    );

    const result = await this.agendaEventService.findByDateRange(
      agenda.id,
      stringStartOfAgendaWeek,
      stringEndOfAgendaWeek,
    );

    return result;
  }
}
