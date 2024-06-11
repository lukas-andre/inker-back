import { Injectable } from '@nestjs/common';

import { DomainNotFound } from '../../global/domain/exceptions/domain.exception';
import {
  BaseUseCase,
  UseCase,
} from '../../global/domain/usecases/base.usecase';
import { ArtistLocationProvider } from '../../locations/infrastructure/database/artistLocation.provider';
import { ArtistLocation } from '../../locations/infrastructure/entities/artistLocation.entity';
import { AgendaEvent } from '../infrastructure/entities/agendaEvent.entity';
import { AgendaProvider } from '../infrastructure/providers/agenda.provider';
import { AgendaEventProvider } from '../infrastructure/providers/agendaEvent.provider';

@Injectable()
export class FindEventFromArtistByEventIdUseCase
  extends BaseUseCase
  implements UseCase
{
  constructor(
    private readonly agendaProvider: AgendaProvider,
    private readonly agendaEventProvider: AgendaEventProvider,
    private readonly artistLocationProvider: ArtistLocationProvider,
  ) {
    super(FindEventFromArtistByEventIdUseCase.name);
  }

  async execute(
    artistId: number,
    eventId: number,
  ): Promise<{
    event: AgendaEvent;
    location: ArtistLocation;
  }> {
    const existsAgenda = await this.agendaProvider.findOne({
      where: {
        artistId,
      },
    });

    if (!existsAgenda) {
      throw new DomainNotFound('Agenda not found');
    }

    const [event, location] = await Promise.all([
      this.agendaEventProvider.findEventByAgendaIdAndEventId(
        existsAgenda.id,
        eventId,
      ),
      this.artistLocationProvider.findById(artistId),
    ]);

    if (!event) {
      throw new DomainNotFound('Event not found');
    }

    if (!location) {
      this.logger.warn('Location not found');
    }

    return {
      event,
      location,
    };
  }
}
