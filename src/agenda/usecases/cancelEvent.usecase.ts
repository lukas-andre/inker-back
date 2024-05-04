import { Injectable } from '@nestjs/common';
import stringify from 'fast-safe-stringify';

import {
  DomainInternalServerError,
  DomainNotFound,
} from '../../global/domain/exceptions/domain.exception';
import {
  BaseUseCase,
  UseCase,
} from '../../global/domain/usecases/base.usecase';
import { Agenda } from '../infrastructure/entities/agenda.entity';
import { AgendaProvider } from '../infrastructure/providers/agenda.provider';
import { AgendaEventProvider } from '../infrastructure/providers/agendaEvent.provider';

@Injectable()
export class CancelEventUseCase extends BaseUseCase implements UseCase {
  constructor(
    private readonly agendaProvider: AgendaProvider,
    private readonly agendaEventProvider: AgendaEventProvider,
  ) {
    super(CancelEventUseCase.name);
  }

  async execute(eventId: number, agendaId: number): Promise<Agenda> {
    const existsAgenda = await this.agendaProvider.findById(agendaId);

    if (!existsAgenda) {
      throw new DomainNotFound('Agenda not found');
    }

    const event = await this.agendaEventProvider.findById(eventId);

    if (!event) {
      throw new DomainNotFound('Event not found');
    }

    try {
      const result = await this.agendaEventProvider.softDelete(eventId);
      this.logger.log(`Delete result: ${stringify(result)}`);
      if (result.affected) {
        return existsAgenda;
      }
      throw new DomainInternalServerError('Fail when event is canceled');
    } catch (error) {
      this.logger.error(`Adding event error ${(error as Error).message}`);
      throw new DomainInternalServerError('Fail when event is canceled');
    }
  }
}
