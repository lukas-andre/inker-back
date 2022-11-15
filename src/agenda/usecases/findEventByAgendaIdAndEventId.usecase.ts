import { Injectable } from '@nestjs/common';

import {
  DomainException,
  DomainNotFound,
} from '../../global/domain/exceptions/domain.exception';
import {
  BaseUseCase,
  UseCase,
} from '../../global/domain/usecases/base.usecase';
import { AgendaEvent } from '../infrastructure/entities/agendaEvent.entity';
import { AgendaProvider } from '../infrastructure/providers/agenda.provider';
import { AgendaEventProvider } from '../infrastructure/providers/agendaEvent.provider';

@Injectable()
export class FindEventByAgendaIdAndEventIdUseCase
  extends BaseUseCase
  implements UseCase
{
  constructor(
    private readonly agendaProvider: AgendaProvider,
    private readonly agendaEventProvider: AgendaEventProvider,
  ) {
    super(FindEventByAgendaIdAndEventIdUseCase.name);
  }

  async execute(
    agendaId: number,
    eventId: number,
  ): Promise<AgendaEvent | DomainException> {
    console.time('agendaService.findById');
    const existsAgenda = await this.agendaProvider.findById(agendaId);
    console.timeEnd('agendaService.findById');

    if (!existsAgenda) {
      throw new DomainNotFound('Agenda not found');
    }

    console.time('agendaEventService.findOne');
    const result = await this.agendaEventProvider.findOne({
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
