import { Injectable } from '@nestjs/common';

import {
  DomainBadRule,
  DomainNotFound,
} from '../../global/domain/exceptions/domain.exception';
import {
  BaseUseCase,
  UseCase,
} from '../../global/domain/usecases/base.usecase';
import { AgendaService } from '../domain/agenda.service';
import { AgendaEventService } from '../domain/agendaEvent.service';
import { AddEventReqDto } from '../infrastructure/dtos/addEventReq.dto';
import { AgendaEvent } from '../infrastructure/entities/agendaEvent.entity';

@Injectable()
export class AddEventUseCase extends BaseUseCase implements UseCase {
  constructor(
    private readonly agendaService: AgendaService,
    private readonly agendaEventService: AgendaEventService,
  ) {
    super(AddEventUseCase.name);
  }

  async execute(addEventDto: AddEventReqDto): Promise<AgendaEvent> {
    const existsAgenda = await this.agendaService.findById(
      addEventDto.agendaId,
    );

    if (!existsAgenda) {
      throw new DomainNotFound('Agenda not found');
    }

    const dateRangeIsInUse =
      await this.agendaEventService.existEventBetweenStartDateAndEndDate(
        existsAgenda.id,
        addEventDto.start,
        addEventDto.end,
      );

    if (dateRangeIsInUse) {
      throw new DomainBadRule('Already exists event in current date range');
    }

    return await this.agendaEventService.saveWithAddEventDto(
      addEventDto,
      existsAgenda,
    );
  }
}
