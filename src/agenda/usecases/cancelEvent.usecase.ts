import { Injectable } from '@nestjs/common';
import { DomainException } from '../../global/domain/exceptions/domain.exception';
import { DomainInternalServerErrorException } from '../../global/domain/exceptions/domainInternalServerError.exception';
import { DomainNotFoundException } from '../../global/domain/exceptions/domainNotFound.exception';
import { BaseUseCase } from '../../global/domain/usecases/base.usecase';
import { AgendaEventService } from '../domain/agendaEvent.service';
import { AgendaService } from '../domain/agenda.service';
import { Agenda } from '../infrastructure/entities/agenda.entity';
import * as stringify from 'json-stringify-safe';

@Injectable()
export class CancelEventUseCase extends BaseUseCase {
  constructor(
    private readonly agendaService: AgendaService,
    private readonly agendaEventService: AgendaEventService,
  ) {
    super(CancelEventUseCase.name);
  }

  async execute(
    eventId: number,
    agendaId: number,
  ): Promise<Agenda | DomainException> {
    const existsAgenda = await this.agendaService.findById(agendaId);

    if (!existsAgenda) {
      return new DomainNotFoundException('Agenda not found');
    }

    const event = await this.agendaEventService.findById(eventId);

    if (!event) {
      return new DomainNotFoundException('Event not found');
    }

    try {
      const result = await this.agendaEventService.softDelete(eventId);
      this.logger.log(`Delete result: ${stringify(result)}`);
      if (result.affected) {
        return existsAgenda;
      }
      return new DomainInternalServerErrorException(
        'Fail when event is canceled',
      );
    } catch (error) {
      this.logger.log(`Adding event error ${error.message}`);
      return new DomainInternalServerErrorException(
        'Fail when event is canceled',
      );
    }
  }
}
