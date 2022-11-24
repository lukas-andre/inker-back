import { Injectable } from '@nestjs/common';

import {
  DomainBadRule,
  DomainNotFound,
} from '../../global/domain/exceptions/domain.exception';
import {
  BaseUseCase,
  UseCase,
} from '../../global/domain/usecases/base.usecase';
import { AddEventReqDto } from '../infrastructure/dtos/addEventReq.dto';
import { AgendaEvent } from '../infrastructure/entities/agendaEvent.entity';
import { AgendaProvider } from '../infrastructure/providers/agenda.provider';
import { AgendaEventProvider } from '../infrastructure/providers/agendaEvent.provider';

@Injectable()
export class AddEventUseCase extends BaseUseCase implements UseCase {
  constructor(
    private readonly agendaProvider: AgendaProvider,
    private readonly agendaEventProvider: AgendaEventProvider,
  ) {
    super(AddEventUseCase.name);
  }

  async execute(addEventDto: AddEventReqDto): Promise<AgendaEvent> {
    const existsAgenda = await this.agendaProvider.findById(
      addEventDto.agendaId,
    );

    if (!existsAgenda) {
      throw new DomainNotFound('Agenda not found');
    }

    const dateRangeIsInUse =
      await this.agendaEventProvider.existEventBetweenStartDateAndEndDate(
        existsAgenda.id,
        addEventDto.start,
        addEventDto.end,
      );

    if (dateRangeIsInUse) {
      throw new DomainBadRule('Already exists event in current date range');
    }

    return await this.agendaEventProvider.saveWithAddEventDto(
      addEventDto,
      existsAgenda,
    );
  }
}
