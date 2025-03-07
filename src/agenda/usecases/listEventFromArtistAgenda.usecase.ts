import { Injectable } from '@nestjs/common';

import { DomainNotFound } from '../../global/domain/exceptions/domain.exception';
import {
  BaseUseCase,
  UseCase,
} from '../../global/domain/usecases/base.usecase';
import { AgendaEvent } from '../infrastructure/entities/agendaEvent.entity';
import { AgendaProvider } from '../infrastructure/providers/agenda.provider';
import { AgendaEventProvider } from '../infrastructure/providers/agendaEvent.provider';
import { UserType } from '../../users/domain/enums/userType.enum';

@Injectable()
export class ListEventFromArtistAgenda extends BaseUseCase implements UseCase {
  constructor(
    private readonly agendaProvider: AgendaProvider,
    private readonly agendaEventProvider: AgendaEventProvider,
  ) {
    super(ListEventFromArtistAgenda.name);
  }

  async execute(id: number, type: UserType): Promise<AgendaEvent[]> {
    console.time('ListEventFromArtistAgenda');
    
    if (type === UserType.ARTIST) {
      return this.getArtistEvents(id);
    } else {
      return this.getCustomerEvents(id);
    }
  }

  private async getArtistEvents(artistId: number): Promise<AgendaEvent[]> {
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

    console.timeEnd('ListEventFromArtistAgenda');
    return result;
  }

  private async getCustomerEvents(customerId: number): Promise<AgendaEvent[]> {
    const result = await this.agendaEventProvider.findByCustomerId(customerId);

    if (!result.length) {
      throw new DomainNotFound('No events found for customer');
    }

    console.timeEnd('ListEventFromArtistAgenda');
    return result;
  }
}
