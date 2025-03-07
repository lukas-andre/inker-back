import { Injectable, UnauthorizedException } from '@nestjs/common';

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
import { ArtistProvider } from '../../artists/infrastructure/database/artist.provider';

@Injectable()
export class FindEventFromArtistByEventIdUseCase
  extends BaseUseCase
  implements UseCase
{
  constructor(
    private readonly agendaProvider: AgendaProvider,
    private readonly agendaEventProvider: AgendaEventProvider,
    private readonly artistLocationProvider: ArtistLocationProvider,
    private readonly artistProvider: ArtistProvider,
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

  async executeForCustomer(
    customerId: number,
    eventId: number,
  ): Promise<{
    event: AgendaEvent;
    location: ArtistLocation;
  }> {
    // Find the event first with agenda relation
    const event = await this.agendaEventProvider.findOne({
      where: { id: eventId },
      relations: ['agenda']
    });
    
    if (!event) {
      throw new DomainNotFound('Event not found');
    }
    
    // Verify the event belongs to this customer
    if (event.customerId !== customerId) {
      this.logger.warn(`Customer ${customerId} attempted to access event ${eventId} which belongs to customer ${event.customerId}`);
      throw new UnauthorizedException('You do not have permission to access this event');
    }
    
    // Get the agenda to find the artist
    const agenda = await this.agendaProvider.findById(event.agenda.id);
    
    if (!agenda) {
      throw new DomainNotFound('Agenda not found');
    }
    
    // Get the artist location
    const location = await this.artistLocationProvider.findById(agenda.artistId);

    const artist = await this.artistProvider.findOne({
      where: { id: agenda.artistId },
      relations: ['contact']
    });

    if (!artist) {
      throw new DomainNotFound('Artist not found');
    }
    
    if (!location) {
      this.logger.warn('Location not found');
    }
    
    return {
      event: { ...event, artist } as any,
      location,
    };
  }
}
