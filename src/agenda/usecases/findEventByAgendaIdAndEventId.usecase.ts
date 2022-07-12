import { Injectable } from '@nestjs/common';
import {
  DomainException,
  DomainNotFound,
} from '../../global/domain/exceptions/domain.exception';
import {
  BaseUseCase,
  UseCase,
} from '../../global/domain/usecases/base.usecase';
import { AgendaService } from '../domain/agenda.service';
import { AgendaEventService } from '../domain/agendaEvent.service';
import { AgendaEvent } from '../infrastructure/entities/agendaEvent.entity';

@Injectable()
export class FindEventByAgendaIdAndEventIdUseCase
  extends BaseUseCase
  implements UseCase
{
  constructor(
    private readonly agendaService: AgendaService,
    private readonly agendaEventService: AgendaEventService,
  ) {
    super(FindEventByAgendaIdAndEventIdUseCase.name);
  }

  async execute(
    agendaId: number,
    eventId: number,
  ): Promise<AgendaEvent | DomainException> {
    console.time('agendaService.findById');
    const existsAgenda = await this.agendaService.findById(agendaId);
    console.timeEnd('agendaService.findById');

    if (!existsAgenda) {
      throw new DomainNotFound('Agenda not found');
    }

    console.time('agendaEventService.findOne');
    const result = await this.agendaEventService.findOne({
      where: {
        id: eventId,
        agenda: {
          id: existsAgenda.id,
        },
      },
    });
    console.timeEnd('agendaEventService.findOne');
    return result;
  }
}
