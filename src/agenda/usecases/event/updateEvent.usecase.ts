import { InjectQueue } from '@nestjs/bull';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Queue } from 'bull';

import {
  DomainConflict,
  DomainNotFound,
} from '../../../global/domain/exceptions/domain.exception';
import { BaseUseCase } from '../../../global/domain/usecases/base.usecase';
import { AgendaEventUpdatedJobType } from '../../../queues/notifications/domain/schemas/agenda';
import { queues } from '../../../queues/queues';
import { UpdateEventReqDto } from '../../infrastructure/dtos/updateEventReq.dto';
import { Agenda } from '../../infrastructure/entities/agenda.entity';
import { AgendaEvent, IStatusLogEntry, UserType as DomainUserType } from '../../infrastructure/entities/agendaEvent.entity';
import { AgendaRepository } from '../../infrastructure/repositories/agenda.repository';
import { AgendaEventRepository } from '../../infrastructure/repositories/agendaEvent.repository';
import { RequestContextService } from '../../../global/infrastructure/services/requestContext.service';

@Injectable()
export class UpdateEventUseCase extends BaseUseCase implements OnModuleDestroy {
  constructor(
    private readonly agendaProvider: AgendaRepository,
    private readonly agendaEventProvider: AgendaEventRepository,
    @InjectQueue(queues.notification.name)
    private readonly notificationQueue: Queue,
    private readonly requestContextService: RequestContextService,
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
    const existsAgenda = await this.agendaProvider.findById(
      updateEventReqDto.agendaId,
    );

    if (!existsAgenda) {
      throw new DomainNotFound('Agenda not found');
    }

    const event = await this.agendaEventProvider.findById(eventId);

    if (!event) {
      throw new DomainNotFound('Event not found');
    }

    const dateRangeIsInUse =
      await this.agendaEventProvider.existEventBetweenStartDateAndEndDate(
        existsAgenda.id,
        updateEventReqDto.start,
        updateEventReqDto.end,
        event.id,
      );

    if (dateRangeIsInUse) {
      throw new DomainConflict('Already exists event in current date range');
    }

    const { userId: authenticatedUserId, userTypeId: roleSpecificId, isNotArtist } = this.requestContextService;
    const currentUserRole: DomainUserType = isNotArtist ? 'customer' : 'artist';

    let updateNotes = 'Event details updated.';
    const changes: string[] = [];

    if (updateEventReqDto.title && updateEventReqDto.title !== event.title) {
      changes.push(`title from "${event.title}" to "${updateEventReqDto.title}"`);
    }
    if (updateEventReqDto.info && updateEventReqDto.info !== event.info) {
      changes.push(`info from "${event.info}" to "${updateEventReqDto.info}"`);
    }
    if (updateEventReqDto.color && updateEventReqDto.color !== event.color) {
      changes.push(`color from "${event.color}" to "${updateEventReqDto.color}"`);
    }
    const newEndDate = new Date(updateEventReqDto.end);
    if (updateEventReqDto.end && newEndDate.getTime() !== event.endDate.getTime()) {
      changes.push(`endDate from "${event.endDate.toISOString()}" to "${newEndDate.toISOString()}"`);
    }
    const newStartDate = new Date(updateEventReqDto.start);
    if (updateEventReqDto.start && newStartDate.getTime() !== event.startDate.getTime()) {
      changes.push(`startDate from "${event.startDate.toISOString()}" to "${newStartDate.toISOString()}"`);
    }
    if (typeof updateEventReqDto.notification === 'boolean' && updateEventReqDto.notification !== event.notification) {
      changes.push(`notification from "${event.notification}" to "${updateEventReqDto.notification}"`);
    }

    if (changes.length > 0) {
      updateNotes = `Event details updated: ${changes.join('; ')}.`;
    }

    const updateLogEntry: IStatusLogEntry = {
      status: event.status,
      timestamp: new Date(),
      actor: {
        userId: authenticatedUserId,
        roleId: roleSpecificId,
        role: currentUserRole,
      },
      notes: updateNotes,
    };

    event.statusLog = event.statusLog ? [...event.statusLog, updateLogEntry] : [updateLogEntry];

    event.title = updateEventReqDto.title || event.title;
    event.info = updateEventReqDto.info || event.info;
    event.color = updateEventReqDto.color || event.color;
    event.endDate = new Date(updateEventReqDto.end) || event.endDate;
    event.startDate = new Date(updateEventReqDto.start) || event.startDate;
    event.notification =
      typeof updateEventReqDto.notification === 'boolean'
        ? updateEventReqDto.notification
        : event.notification;

    await this.agendaEventProvider.save(event);

    await this.pushAgendaEventUpdatedEvent(event, existsAgenda);

    return event;
  }

  private async pushAgendaEventUpdatedEvent(
    event: AgendaEvent,
    existsAgenda: Agenda,
  ) {
    const queueMessage: AgendaEventUpdatedJobType = {
      jobId: 'EVENT_UPDATED',
      metadata: {
        eventId: event.id,
        artistId: existsAgenda.artistId,
        customerId: event.customerId,
      },
      notificationTypeId: 'EMAIL',
    };

    try {
      const job = await this.notificationQueue.add(queueMessage);
      this.logger.log({
        message: 'Event published to notification queue',
        data: queueMessage,
        job,
      });
    } catch (error) {
      this.logger.error(error);
    }
  }
}
