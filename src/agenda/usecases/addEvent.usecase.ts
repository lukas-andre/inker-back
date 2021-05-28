import { Injectable, Logger } from '@nestjs/common';
import { DomainException } from '../../global/domain/exceptions/domain.exception';
import { DomainNotFoundException } from '../../global/domain/exceptions/domainNotFound.exception';
import { AgendaService } from '../domain/agenda.service';
import { AgendaEventService } from '../domain/agendaEvent.service';
import { AddEventReqDto } from '../intrastructure/dtos/addEventReq.dto';
import { DomainConflictException } from '../../global/domain/exceptions/domainConflict.exception';
import { AgendaEvent } from '../intrastructure/entities/agendaEvent.entity';
import { DomainInternalServerErrorException } from '../../global/domain/exceptions/domainInternalServerError.exception';
import { ServiceError } from '../../global/domain/interfaces/serviceError';
import { handleServiceError } from '../../global/domain/utils/handleServiceError';
import { isServiceError } from 'src/global/domain/guards/isServiceError.guard';

@Injectable()
export class AddEventUseCase {
  private readonly serviceName = AddEventUseCase.name;
  private readonly logger = new Logger(this.serviceName);

  constructor(
    private readonly agendaService: AgendaService,
    private readonly agendaEventService: AgendaEventService,
  ) {}

  async execute(
    addEventDto: AddEventReqDto,
  ): Promise<AgendaEvent | DomainException> {
    const existsAgenda = await this.agendaService.findById(
      addEventDto.agendaId,
    );

    if (!existsAgenda) {
      return new DomainNotFoundException('Agenda not found');
    }

    const dateRangeIsInUse = await this.agendaEventService.existEventBetweenStartDateAndEndDate(
      existsAgenda.id,
      addEventDto.start,
      addEventDto.end,
    );

    if (isServiceError(dateRangeIsInUse)) {
      return new DomainConflictException(
        handleServiceError(dateRangeIsInUse, this.logger),
      );
    }

    if (dateRangeIsInUse) {
      return new DomainConflictException(
        'Already exists event in current date range',
      );
    }

    const event = new AgendaEvent();
    event.agenda = existsAgenda;
    event.title = addEventDto.title;
    event.info = addEventDto.info;
    event.color = addEventDto.color;
    event.end = addEventDto.end as any;
    event.start = addEventDto.start as any;
    event.notification = addEventDto.notification;

    try {
      return this.agendaEventService.save(event);
    } catch (error) {
      this.logger.log(`Adding event error ${error.message}`);
      return new DomainInternalServerErrorException('Failed saving event');
    }
  }
}
