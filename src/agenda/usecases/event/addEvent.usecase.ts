import { InjectQueue } from '@nestjs/bull';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Queue } from 'bull';

import { CustomerRepository } from '../../../customers/infrastructure/providers/customer.repository';
import {
  DomainBadRule,
  DomainNotFound,
} from '../../../global/domain/exceptions/domain.exception';
import {
  BaseUseCase,
  UseCase,
} from '../../../global/domain/usecases/base.usecase';
import { AgendaEventcreatedJobType } from '../../../queues/notifications/domain/schemas/agenda';
import { queues } from '../../../queues/queues';
import { AddEventReqDto } from '../../infrastructure/dtos/addEventReq.dto';
import { AgendaRepository } from '../../infrastructure/repositories/agenda.repository';
import { AgendaEventRepository } from '../../infrastructure/repositories/agendaEvent.repository';
import { CreateAgendaEventService } from '../../domain/services/createAgendaEvent.service';

@Injectable()
export class AddEventUseCase
  extends BaseUseCase
  implements UseCase, OnModuleDestroy
{
  constructor(
    private readonly agendaProvider: AgendaRepository,
    private readonly agendaEventProvider: AgendaEventRepository,
    private readonly customerProvider: CustomerRepository,
    private readonly createAgendaEventService: CreateAgendaEventService,
    @InjectQueue(queues.notification.name)
    private readonly notificationQueue: Queue,
  ) {
    super(AddEventUseCase.name);
  }

  async onModuleDestroy() {
    await this.notificationQueue.close();
  }

  async execute(addEventDto: AddEventReqDto): Promise<void> {
    const existsAgenda = await this.agendaProvider.findById(
      addEventDto.agendaId,
    );

    if (!existsAgenda) {
      throw new DomainNotFound('Agenda not found');
    }

    const existsCustomer = await this.customerProvider.findById(
      addEventDto.customerId,
    );

    if (!existsCustomer) {
      throw new DomainNotFound('Customer not found');
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

    // Use the centralized event creation service
    const result = await this.createAgendaEventService.createEventWithHistory({
      agendaId: existsAgenda.id,
      title: addEventDto.title,
      info: addEventDto.info,
      color: addEventDto.color,
      startDate: addEventDto.start,
      endDate: addEventDto.end,
      notification: addEventDto.notification,
      customerId: existsCustomer.id,
      createdBy: existsAgenda.artistId, // Using artist ID as creator
    });

    if (!result.transactionIsOK || !result.eventId) {
      throw new DomainBadRule('Error creating event');
    }
    
    // Send notification
    const queueMessage: AgendaEventcreatedJobType = {
      jobId: 'EVENT_CREATED',
      metadata: {
        eventId: result.eventId,
        artistId: existsAgenda.artistId,
        customerId: existsCustomer.id,
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
