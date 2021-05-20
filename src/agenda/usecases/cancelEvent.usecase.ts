import { Injectable, Logger } from '@nestjs/common';
import { DomainException } from '../../global/domain/exceptions/domain.exception';
import { DomainNotFoundException } from '../../global/domain/exceptions/domainNotFound.exception';
import { AgendaService } from '../domain/agenda.service';
import { AgendaEventService } from '../domain/agendaEvent.service';
import { DomainInternalServerErrorException } from '../../global/domain/exceptions/domainInternalServerError.exception';
import { Agenda } from '../intrastructure/entities/agenda.entity';
import * as stringify from 'json-stringify-safe';

@Injectable()
export class CancelEventUseCase {
  private readonly logger = new Logger(CancelEventUseCase.name);

  constructor(
    private readonly agendaService: AgendaService,
    private readonly agendaEventService: AgendaEventService,
  ) {}

  async execute(
    eventId: string,
    agendaId: string,
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
      // TODO: HACER UN SOFTDELETE A MANO, UN CAMPO canceled O AGLO ASI
      const result = await this.agendaEventService.delete(eventId);
      this.logger.log(`Delete result: ${stringify(result)}`);
      return existsAgenda;
    } catch (error) {
      this.logger.log(`Adding event error ${error.message}`);
      return new DomainInternalServerErrorException('Failed saving event');
    }
  }
}
