import { Injectable } from '@nestjs/common';
import { DomainException } from '../../global/domain/exceptions/domain.exception';
import { DomainNotFoundException } from '../../global/domain/exceptions/domainNotFound.exception';
import { AgendaService } from '../domain/agenda.service';
import { AgendaEventService } from '../domain/agendaEvent.service';
import { AddEventReqDto } from '../intrastructure/dtos/addEventReq.dto';
import { DomainConflictException } from '../../global/domain/exceptions/domainConflict.exception';
import { AgendaEvent } from '../intrastructure/entities/agendaEvent.entity';
import { isServiceError } from '../../global/domain/guards/isServiceError.guard';
import { BaseUseCase } from 'src/global/domain/usecases/base.usecase';

@Injectable()
export class AddEventUseCase extends BaseUseCase {
  constructor(
    private readonly agendaService: AgendaService,
    private readonly agendaEventService: AgendaEventService,
  ) {
    super(AddEventUseCase.name);
  }

  async execute(
    addEventDto: AddEventReqDto,
  ): Promise<AgendaEvent | DomainException> {
    const existsAgenda = await this.agendaService.findById(
      addEventDto.agendaId,
    );

    if (!existsAgenda) {
      return new DomainNotFoundException('Agenda not found');
    }

    const dateRangeIsInUse =
      await this.agendaEventService.existEventBetweenStartDateAndEndDate(
        existsAgenda.id,
        addEventDto.start,
        addEventDto.end,
      );

    if (isServiceError(dateRangeIsInUse)) {
      return new DomainConflictException(
        this.handleServiceError(dateRangeIsInUse),
      );
    }

    if (dateRangeIsInUse) {
      return new DomainConflictException(
        'Already exists event in current date range',
      );
    }

    const savedAgendaEvent = await this.agendaEventService.saveWithAddEventDto(
      addEventDto,
      existsAgenda,
    );

    return isServiceError(savedAgendaEvent)
      ? new DomainConflictException(this.handleServiceError(savedAgendaEvent))
      : savedAgendaEvent;
  }
}
