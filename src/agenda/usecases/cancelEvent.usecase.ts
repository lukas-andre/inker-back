import { InjectQueue } from '@nestjs/bull';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Queue } from 'bull';
import stringify from 'fast-safe-stringify';

import {
  DomainInternalServerError,
  DomainNotFound,
} from '../../global/domain/exceptions/domain.exception';
import {
  BaseUseCase,
  UseCase,
} from '../../global/domain/usecases/base.usecase';
import { AgendaEventCanceledJobType } from '../../queues/notifications/domain/schemas/agenda';
import { queues } from '../../queues/queues';
import { Agenda } from '../infrastructure/entities/agenda.entity';
import { AgendaEvent } from '../infrastructure/entities/agendaEvent.entity';
import { AgendaRepository } from '../infrastructure/repositories/agenda.repository';
import { AgendaEventRepository } from '../infrastructure/repositories/agendaEvent.repository';

@Injectable()
export class CancelEventUseCase
  extends BaseUseCase
  implements UseCase, OnModuleDestroy
{
  constructor(
    private readonly agendaProvider: AgendaRepository,
    private readonly agendaEventProvider: AgendaEventRepository,
    @InjectQueue(queues.notification.name)
    private readonly notificationQueue: Queue,
  ) {
    super(CancelEventUseCase.name);
  }

  async onModuleDestroy() {
    await this.notificationQueue.close();
  }

  async execute(eventId: string, agendaId: string): Promise<Agenda> {
    const existsAgenda = await this.agendaProvider.findById(agendaId);

    if (!existsAgenda) {
      throw new DomainNotFound('Agenda not found');
    }

    const event = await this.agendaEventProvider.findById(eventId);

    if (!event) {
      throw new DomainNotFound('Event not found');
    }

    try {
      const result = await this.agendaEventProvider.softDelete(eventId);
      this.logger.log(`Delete result: ${stringify(result)}`);
      if (result.affected) {
        await this.pushAgendaEventCanceledEvent(event, existsAgenda);
        return existsAgenda;
      }
      throw new DomainInternalServerError('Fail when event is canceled');
    } catch (error) {
      this.logger.error(`Adding event error ${(error as Error).message}`);
      throw new DomainInternalServerError('Fail when event is canceled');
    }
  }

  private async pushAgendaEventCanceledEvent(
    event: AgendaEvent,
    existsAgenda: Agenda,
  ) {
    const queueMessage: AgendaEventCanceledJobType = {
      jobId: 'EVENT_CANCELED',
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
