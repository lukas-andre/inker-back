import { Injectable } from '@nestjs/common';

import { DomainNotFound } from '../../../global/domain/exceptions/domain.exception';
import {
  BaseUseCase,
  UseCase,
} from '../../../global/domain/usecases/base.usecase';
import { UserType } from '../../../users/domain/enums/userType.enum';
import { AgendaEventStatus } from '../../domain/enum/agendaEventStatus.enum';
import { AgendaEvent } from '../../infrastructure/entities/agendaEvent.entity';
import { AgendaRepository } from '../../infrastructure/repositories/agenda.repository';
import { AgendaEventRepository } from '../../infrastructure/repositories/agendaEvent.repository';

@Injectable()
export class ListEventFromArtistAgenda extends BaseUseCase implements UseCase {
  constructor(
    private readonly agendaProvider: AgendaRepository,
    private readonly agendaEventProvider: AgendaEventRepository,
  ) {
    super(ListEventFromArtistAgenda.name);
  }

  async execute(
    id: string,
    type: UserType,
    status?: string,
  ): Promise<AgendaEvent[]> {
    console.time('ListEventFromArtistAgenda');

    if (type === UserType.ARTIST) {
      return this.getArtistEvents(id, status);
    } else {
      return this.getCustomerEvents(id, status);
    }
  }

  private async getArtistEvents(
    artistId: string,
    status?: string,
  ): Promise<AgendaEvent[]> {
    const existsAgenda = await this.agendaProvider.findOne({
      where: {
        artistId,
      },
    });

    if (!existsAgenda) {
      throw new DomainNotFound('Agenda not found');
    }

    // Use status if provided
    if (
      status &&
      Object.values(AgendaEventStatus).includes(status as AgendaEventStatus)
    ) {
      const result = await this.agendaEventProvider.find({
        where: {
          agenda: { id: existsAgenda.id },
          status: status as AgendaEventStatus,
        },
      });

      if (!result.length) {
        throw new DomainNotFound(`No events found with status ${status}`);
      }

      console.timeEnd('ListEventFromArtistAgenda');
      return result;
    }

    const result = await this.agendaEventProvider.findByArtistId(
      existsAgenda.id,
    );

    if (!result.length) {
      throw new DomainNotFound('No events found');
    }

    console.timeEnd('ListEventFromArtistAgenda');
    return result;
  }

  private async getCustomerEvents(
    customerId: string,
    status?: string,
  ): Promise<AgendaEvent[]> {
    // Use status if provided
    if (
      status &&
      Object.values(AgendaEventStatus).includes(status as AgendaEventStatus)
    ) {
      const result = await this.agendaEventProvider.find({
        where: {
          customerId,
          status: status as AgendaEventStatus,
        },
      });

      if (!result.length) {
        throw new DomainNotFound(
          `No events found for customer with status ${status}`,
        );
      }

      console.timeEnd('ListEventFromArtistAgenda');
      return result;
    }

    const result = await this.agendaEventProvider.findByCustomerId(customerId);

    if (!result.length) {
      throw new DomainNotFound('No events found for customer');
    }

    console.timeEnd('ListEventFromArtistAgenda');
    return result;
  }
}
