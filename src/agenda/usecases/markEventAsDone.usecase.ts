import { Injectable } from '@nestjs/common';

import {
  DomainNotAcceptable,
  DomainNotFound,
} from '../../global/domain/exceptions/domain.exception';
import {
  BaseUseCase,
  UseCase,
} from '../../global/domain/usecases/base.usecase';
import { DefaultResponseDto } from '../../global/infrastructure/dtos/defaultResponse.dto';
import { DefaultResponseHelper } from '../../global/infrastructure/helpers/defaultResponse.helper';
import {
  AGENDA_EVENT_IS_ALREADY_DONE,
  AGENDA_EVENT_NOT_EXISTS,
} from '../domain/errors/codes';
import { AgendaEventProvider } from '../infrastructure/providers/agendaEvent.provider';

@Injectable()
export class MarkEventAsDoneUseCase extends BaseUseCase implements UseCase {
  constructor(private readonly agendaEventProvider: AgendaEventProvider) {
    super(MarkEventAsDoneUseCase.name);
  }

  async execute(
    agendaId: number,
    eventId: number,
  ): Promise<DefaultResponseDto> {
    const event = await this.agendaEventProvider.findAgendaEventForMarkAsDone(
      agendaId,
      eventId,
    );

    if (!event) {
      throw new DomainNotFound(AGENDA_EVENT_NOT_EXISTS);
    }

    if (event.done) {
      throw new DomainNotAcceptable(AGENDA_EVENT_IS_ALREADY_DONE);
    }

    await this.agendaEventProvider.markAsDone(agendaId, eventId);

    return DefaultResponseHelper.ok;
  }
}
