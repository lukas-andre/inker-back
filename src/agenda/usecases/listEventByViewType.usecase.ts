import { Injectable, Logger } from '@nestjs/common';
import { DomainException } from '../../global/domain/exceptions/domain.exception';
import { DomainNotFoundException } from '../../global/domain/exceptions/domainNotFound.exception';
import { AgendaService } from '../domain/agenda.service';
import { AgendaEventService } from '../domain/agendaEvent.service';
import { AgendaEvent } from '../intrastructure/entities/agendaEvent.entity';
import { DomainInternalServerErrorException } from '../../global/domain/exceptions/domainInternalServerError.exception';
import { ListEventByViewTypeQueryDto } from '../intrastructure/dtos/listEventByViewTypeQuery.dto';
import { AgendaViewType } from '../domain/enum/agendaViewType.enum';
import { Agenda } from '../intrastructure/entities/agenda.entity';
import { DomainConflictException } from '../../global/domain/exceptions/domainConflict.exception';
import { handleServiceError } from '../../global/domain/utils/handleServiceError';
import { isServiceError } from '../../global/domain/guards/isServiceError.guard';
import { endOfWeek, format, startOfWeek } from 'date-fns';

@Injectable()
export class ListEventByViewTypeUseCase {
  private readonly serviceName = ListEventByViewTypeUseCase.name;
  private readonly logger = new Logger(this.serviceName);

  constructor(
    private readonly agendaService: AgendaService,
    private readonly agendaEventService: AgendaEventService,
  ) {}

  async execute(
    agendaId: number,
    listEventByViewTypeQueryDto: ListEventByViewTypeQueryDto,
  ): Promise<AgendaEvent[] | DomainException> {
    let result: AgendaEvent[] | DomainException;

    const existsAgenda = await this.agendaService.findById(agendaId);

    if (!existsAgenda) {
      return new DomainNotFoundException('Agenda not found');
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
        result = new DomainInternalServerErrorException('Failed saving event');
        break;
    }
    return result;
  }

  private async handleDayViewType(
    agenda: Agenda,
    date: string,
  ): Promise<AgendaEvent[] | DomainException> {
    // ESTA ES LA MANERA MAS POCO ELEGANTE DE CREAR EL INICIO Y EL FIN
    // DE UN DIA EN UNA DATE CON FORMATO yyyy-MM-dd
    const startOfDay = date + ' 00:00:00';
    const endOfDay = date + ' 23:59:59';

    const result = await this.agendaEventService.findByDateRange(
      agenda.id,
      startOfDay,
      endOfDay,
    );

    if (isServiceError(result)) {
      return new DomainConflictException(
        handleServiceError(result, this.logger),
      );
    }

    return result;
  }

  private async handleWeekViewType(
    agenda: Agenda,
    date: string,
  ): Promise<AgendaEvent[] | DomainException> {
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

    if (isServiceError(result)) {
      return new DomainConflictException(
        handleServiceError(result, this.logger),
      );
    }

    return result;
  }
}
