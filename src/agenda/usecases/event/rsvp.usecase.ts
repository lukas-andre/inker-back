import { Injectable, OnModuleDestroy } from '@nestjs/common';

import { CustomerRepository } from '../../../customers/infrastructure/providers/customer.repository';
import {
  DomainNotFound,
  DomainUnProcessableEntity,
} from '../../../global/domain/exceptions/domain.exception';
import {
  BaseUseCase,
  UseCase,
} from '../../../global/domain/usecases/base.usecase';
import { DefaultResponseDto } from '../../../global/infrastructure/dtos/defaultResponse.dto';
import { DefaultResponse } from '../../../global/infrastructure/helpers/defaultResponse.helper';
import { RequestContextService } from '../../../global/infrastructure/services/requestContext.service';
import { AgendaEventTransition } from '../../domain/services/eventStateMachine.service';
import { ChangeEventStatusReqDto } from '../../infrastructure/dtos/changeEventStatusReq.dto';
import { AgendaRepository } from '../../infrastructure/repositories/agenda.repository';
import { AgendaEventRepository } from '../../infrastructure/repositories/agendaEvent.repository';

import { ChangeEventStatusUsecase } from './changeEventStatus.usecase';

@Injectable()
export class RsvpUseCase extends BaseUseCase implements UseCase {
  constructor(
    private readonly agendaProvider: AgendaRepository,
    private readonly customerProvider: CustomerRepository,
    private readonly changeEventStatusUsecase: ChangeEventStatusUsecase,
    private readonly agendaEventProvider: AgendaEventRepository,
    private readonly requestContext: RequestContextService,
  ) {
    super(RsvpUseCase.name);
  }

  async execute(
    agendaId: string,
    eventId: string,
    willAttend: boolean,
  ): Promise<DefaultResponseDto> {
    const authenticatedUserId = this.requestContext.userId;
    const authenticatedUserSpecificId = this.requestContext.userTypeId;

    if (this.requestContext.isNotArtist === false) {
      throw new DomainUnProcessableEntity(
        'RSVP action must be performed by a customer.',
      );
    }
    const customerId = authenticatedUserSpecificId;

    const event = await this.agendaEventProvider.findOne({
      where: { id: eventId, agenda: { id: agendaId } },
      select: ['id', 'customerId'],
    });

    if (!event) {
      throw new DomainNotFound(
        'Event not found or does not belong to the specified agenda.',
      );
    }

    if (event.customerId !== customerId) {
      throw new DomainUnProcessableEntity(
        'RSVP action not authorized for this customer/event combination.',
      );
    }

    const eventAction = willAttend
      ? AgendaEventTransition.CONFIRM
      : AgendaEventTransition.REJECT;

    const changeStatusDto: ChangeEventStatusReqDto = {
      eventAction,
    };

    await this.changeEventStatusUsecase.execute(
      agendaId,
      eventId,
      changeStatusDto,
    );

    return DefaultResponse.ok;
  }
}
