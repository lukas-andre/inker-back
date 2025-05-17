import { Injectable } from '@nestjs/common';

import { AgendaEventStatus } from '../../domain/enum/agendaEventStatus.enum';
import {
  ARTIST_NOT_AUTHORIZED,
  CUSTOMER_NOT_AUTHORIZED,
  INVALID_EVENT_STATUS_TRANSITION,
} from '../../domain/errors/codes';
import { DomainUnProcessableEntity } from '../../../global/domain/exceptions/domain.exception';
import {
  BaseUseCase,
  UseCase,
} from '../../../global/domain/usecases/base.usecase';
import { RequestContextService } from '../../../global/infrastructure/services/requestContext.service';
import { ChangeEventStatusReqDto } from '../../infrastructure/dtos/changeEventStatusReq.dto';
import { AgendaRepository } from '../../infrastructure/repositories/agenda.repository';
import { AgendaEventRepository } from '../../infrastructure/repositories/agendaEvent.repository';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { queues } from '../../../queues/queues';

import { EventStateMachineService, AgendaEventTransition, StateMachineContext } from '../../domain/services/eventStateMachine.service';
import { UserType } from '../../../users/domain/enums/userType.enum';

@Injectable()
export class ChangeEventStatusUsecase extends BaseUseCase implements UseCase {
  constructor(
    private readonly requestContext: RequestContextService,
    private readonly agendaProvider: AgendaRepository,
    private readonly agendaEventProvider: AgendaEventRepository,
    @InjectQueue(queues.notification.name)
    private readonly notificationsQueue: Queue,
    private readonly eventStateMachine: EventStateMachineService,
  ) {
    super(ChangeEventStatusUsecase.name);
  }

  async execute(
    agendaId: string,
    eventId: string,
    dto: ChangeEventStatusReqDto,
  ): Promise<void> {
    const { eventAction, reason, notes, newStartDate, newEndDate } = dto;
    const { userTypeId: roleSpecificId, userId: authenticatedUserId, isNotArtist, userType } = this.requestContext;

    const event = await this.agendaEventProvider.findOne({
      where: { id: eventId }, 
      relations: ['agenda'],
    });

    if (!event) {
      throw new DomainUnProcessableEntity('Event not found');
    }
    
    if (event.agenda.id !== agendaId) {
        throw new DomainUnProcessableEntity('Event does not belong to the specified agenda.');
    }

    const eventArtistId = event.agenda.artistId;
    const eventCustomerId = event.customerId;

    let authorized = false;

    if (!isNotArtist && roleSpecificId === eventArtistId) {
        if (eventAction === AgendaEventTransition.CONFIRM || eventAction === AgendaEventTransition.REJECT) {
            authorized = false;
        } else {
            authorized = true;
        }
    } else if (isNotArtist && eventCustomerId && roleSpecificId === eventCustomerId) {
        switch (eventAction) {
            case AgendaEventTransition.CONFIRM:
            case AgendaEventTransition.REJECT:
            case AgendaEventTransition.CANCEL:
            case AgendaEventTransition.RESCHEDULE:
                authorized = true;
                break;
            default:
                authorized = false;
        }
    } else {
        authorized = false;
    }

    if (!authorized) {
      throw new DomainUnProcessableEntity(
        `User ${authenticatedUserId} (roleId: ${roleSpecificId}, isNotArtist: ${isNotArtist}) is not authorized to perform action '${eventAction}' on this event (artist: ${eventArtistId}, customer: ${eventCustomerId}).`,
      );
    }
    
    const stateMachineContext: StateMachineContext = {
        eventEntity: event,
        actor: {
            userId: authenticatedUserId,
            roleId: roleSpecificId,
            role: userType === UserType.ARTIST ? UserType.ARTIST : (userType === UserType.CUSTOMER ? UserType.CUSTOMER : UserType.SYSTEM),
        },
        payload: { 
            reason, 
            notes, 
            newStartDate,
            newEndDate,
        },
    };

    await this.eventStateMachine.transition(
      event.status,
      eventAction,
      stateMachineContext,
    );
  }
}