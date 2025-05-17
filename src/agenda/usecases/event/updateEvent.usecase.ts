import { InjectQueue } from '@nestjs/bull';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Queue } from 'bull';

import {
  DomainConflict,
  DomainNotFound,
  DomainForbidden,
  DomainUnProcessableEntity,
} from '../../../global/domain/exceptions/domain.exception';
import { BaseUseCase } from '../../../global/domain/usecases/base.usecase';
import { AgendaEventUpdatedJobType } from '../../../queues/notifications/domain/schemas/agenda';
import { queues } from '../../../queues/queues';
import { UpdateEventReqDto } from '../../infrastructure/dtos/updateEventReq.dto';
import { Agenda } from '../../infrastructure/entities/agenda.entity';
import {
  AgendaEvent,
  IStatusLogEntry,
} from '../../infrastructure/entities/agendaEvent.entity';
import { AgendaRepository } from '../../infrastructure/repositories/agenda.repository';
import { AgendaEventRepository } from '../../infrastructure/repositories/agendaEvent.repository';
import { RequestContextService } from '../../../global/infrastructure/services/requestContext.service';
import { EventStateMachineService, StateMachineContext, AgendaEventTransition } from '../../domain/services/eventStateMachine.service';
import { EventActionEngineService, } from '../../domain/services/eventActionEngine.service';
import { AgendaEventStatus } from '../../domain/enum/agendaEventStatus.enum';
import { EventActionsResultDto } from '../../domain/dtos';
import { UserType } from '../../../users/domain/enums/userType.enum';

@Injectable()
export class UpdateEventUseCase extends BaseUseCase implements OnModuleDestroy {
  constructor(
    private readonly agendaProvider: AgendaRepository,
    private readonly agendaEventProvider: AgendaEventRepository,
    @InjectQueue(queues.notification.name)
    private readonly notificationQueue: Queue,
    private readonly requestContextService: RequestContextService,
    private readonly eventStateMachineService: EventStateMachineService,
    private readonly eventActionEngineService: EventActionEngineService,
  ) {
    super(UpdateEventUseCase.name);
  }
  async onModuleDestroy() {
    await this.notificationQueue.close();
  }

  async execute(
    updateEventReqDto: UpdateEventReqDto,
    eventId: string,
  ): Promise<AgendaEvent> {
    const { userId, userTypeId, isNotArtist, userType } = this.requestContextService;

    const actorRole: UserType = isNotArtist ? UserType.CUSTOMER : UserType.ARTIST;
    const actorForStateMachine = {
      userId,
      roleId: userTypeId,
      role: actorRole,
    };

    const event = await this.agendaEventProvider.findById(eventId);
    if (!event) {
      throw new DomainNotFound('Event not found');
    }

    let agenda = event.agenda;
    if (!agenda) {
      this.logger.warn(`Agenda not pre-loaded for event ${eventId}, fetching separately.`);
      agenda = await this.agendaProvider.findById(updateEventReqDto.agendaId);
      if (!agenda) {
        throw new DomainNotFound(`Agenda with ID ${updateEventReqDto.agendaId} not found.`);
      }
      event.agenda = agenda;
    }

    if (agenda.id !== updateEventReqDto.agendaId) {
      throw new DomainForbidden(
        'Event does not belong to the specified agenda.',
      );
    }

    const availableActions: EventActionsResultDto = await this.eventActionEngineService.getAvailableActions({
      event,
      userId: userId,
      userType: userType,
    });

    const newStartDate = updateEventReqDto.start
      ? new Date(updateEventReqDto.start)
      : undefined;
    const newEndDate = updateEventReqDto.end
      ? new Date(updateEventReqDto.end)
      : undefined;

    const isDateChangeRequested =
      (newStartDate && newStartDate.getTime() !== event.startDate.getTime()) ||
      (newEndDate && newEndDate.getTime() !== event.endDate.getTime());

    if (isDateChangeRequested) {
      if (!availableActions.canReschedule) {
        throw new DomainForbidden(
          'User is not authorized to reschedule this event or event cannot be rescheduled in its current state.',
        );
      }
      if (!newStartDate || !newEndDate) {
        throw new DomainUnProcessableEntity('Both start and end dates are required for rescheduling.');
      }

      const stateMachineContext: StateMachineContext = {
        eventEntity: event,
        actor: actorForStateMachine,
        payload: {
          startDate: newStartDate,
          endDate: newEndDate,
          rescheduleReason: 'Event dates updated via general update endpoint.',
        },
      };
      await this.eventStateMachineService.transition(
        event.status as AgendaEventStatus,
        AgendaEventTransition.RESCHEDULE,
        stateMachineContext,
      );

      const updatedEvent = await this.agendaEventProvider.findById(eventId);
      return updatedEvent;
    }

    if (!availableActions.canEdit) {
      throw new DomainForbidden(
        'User is not authorized to edit this event or event cannot be edited in its current state.',
      );
    }

    const changes: string[] = [];
    let detailsUpdated = false;

    if (updateEventReqDto.title && updateEventReqDto.title !== event.title) {
      changes.push(`title from "${event.title}" to "${updateEventReqDto.title}"`);
      event.title = updateEventReqDto.title;
      detailsUpdated = true;
    }
    if (updateEventReqDto.info && updateEventReqDto.info !== event.info) {
      changes.push(`info from "${event.info}" to "${updateEventReqDto.info}"`);
      event.info = updateEventReqDto.info;
      detailsUpdated = true;
    }
    if (updateEventReqDto.color && updateEventReqDto.color !== event.color) {
      changes.push(`color from "${event.color}" to "${updateEventReqDto.color}"`);
      event.color = updateEventReqDto.color;
      detailsUpdated = true;
    }
    if (typeof updateEventReqDto.notification === 'boolean' && updateEventReqDto.notification !== event.notification) {
      changes.push(`notification from "${event.notification}" to "${updateEventReqDto.notification}"`);
      event.notification = updateEventReqDto.notification;
      detailsUpdated = true;
    }

    if (detailsUpdated) {
      const updateNotes = `Event details updated: ${changes.join('; ')}.`;
      const updateLogEntry: IStatusLogEntry = {
        status: event.status,
        timestamp: new Date(),
        actor: actorForStateMachine,
        notes: updateNotes,
      };
      event.statusLog = event.statusLog
        ? [...event.statusLog, updateLogEntry]
        : [updateLogEntry];

      await this.agendaEventProvider.save(event);
      if (!isDateChangeRequested) {
        await this.pushAgendaEventUpdatedEvent(event, agenda);
      }
    }
    return event;
  }

  private async pushAgendaEventUpdatedEvent(event: AgendaEvent, agenda: Agenda) {
    const queueMessage: AgendaEventUpdatedJobType = {
      jobId: 'EVENT_UPDATED',
      metadata: {
        eventId: event.id,
        artistId: agenda.artistId,
        customerId: event.customerId,
      },
      notificationTypeId: 'EMAIL',
    };

    try {
      const job = await this.notificationQueue.add(queueMessage);
      this.logger.log({
        message: 'Event published to notification queue for general update',
        data: queueMessage,
        jobId: job.id,
      });
    } catch (error) {
      this.logger.error(
        'Failed to publish event update to notification queue',
        { error, eventId: event.id },
      );
    }
  }
}
