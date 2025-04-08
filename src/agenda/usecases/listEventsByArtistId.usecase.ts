import { Injectable } from '@nestjs/common';

import { DomainNotFound } from '../../global/domain/exceptions/domain.exception';
import {
  BaseUseCase,
  UseCase,
} from '../../global/domain/usecases/base.usecase';
import { AgendaEvent } from '../infrastructure/entities/agendaEvent.entity';
import { AgendaRepository } from '../infrastructure/repositories/agenda.repository';
import { AgendaEventRepository } from '../infrastructure/repositories/agendaEvent.repository';

@Injectable()
export class ListEventsByArtistId extends BaseUseCase implements UseCase {
  constructor(
    private readonly agendaProvider: AgendaRepository,
    private readonly agendaEventProvider: AgendaEventRepository,
  ) {
    super(ListEventsByArtistId.name);
  }

  async execute(artistId: string): Promise<AgendaEvent[]> {
    console.time('ListEventsByAgendaId');
    const existsAgenda = await this.agendaProvider.findOne({
      where: {
        artistId,
      },
    });

    if (!existsAgenda) {
      throw new DomainNotFound('Agenda not found');
    }

    const result = await this.agendaEventProvider.findByArtistId(artistId);

    if (!result.length) {
      throw new DomainNotFound('No events found');
    }

    console.timeEnd('ListEventsByAgendaId');
    return result;
  }
}
