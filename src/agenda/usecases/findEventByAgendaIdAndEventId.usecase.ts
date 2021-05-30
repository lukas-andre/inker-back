import { Injectable } from '@nestjs/common';
import { DomainException } from '../../global/domain/exceptions/domain.exception';
import { DomainInternalServerErrorException } from '../../global/domain/exceptions/domainInternalServerError.exception';
import { DomainNotFoundException } from '../../global/domain/exceptions/domainNotFound.exception';
import { BaseUseCase } from '../../global/domain/usecases/base.usecase';
import { AgendaService } from '../domain/agenda.service';
import { AgendaEventService } from '../domain/agendaEvent.service';
import { AgendaEvent } from '../intrastructure/entities/agendaEvent.entity';

@Injectable()
export class FindEventByAgendaIdAndEventIdUseCase extends BaseUseCase {
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
      return new DomainNotFoundException('Agenda not found');
    }

    try {
      console.time('agendaEventService.findOne');
      const result = this.agendaEventService.findOne({
        where: { agenda: existsAgenda, id: eventId },
      });
      console.timeEnd('agendaEventService.findOne');
      return result;
    } catch (error) {
      this.logger.log(`Adding event error ${error.message}`);
      return new DomainInternalServerErrorException('Failed saving event');
    }
  }
}
