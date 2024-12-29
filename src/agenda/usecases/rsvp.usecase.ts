import { InjectQueue } from '@nestjs/bull';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Queue } from 'bull';

import { CustomerProvider } from '../../customers/infrastructure/providers/customer.provider';
import { DomainNotFound } from '../../global/domain/exceptions/domain.exception';
import {
  BaseUseCase,
  UseCase,
} from '../../global/domain/usecases/base.usecase';
import { DefaultResponseDto } from '../../global/infrastructure/dtos/defaultResponse.dto';
import { DefaultResponse } from '../../global/infrastructure/helpers/defaultResponse.helper';
import {
  RsvpAcceptedJobType,
  RsvpDeclinedJobType,
  RsvpJobType,
} from '../../queues/notifications/domain/schemas/agenda';
import { queues } from '../../queues/queues';
import { AgendaInvitationStatusEnum } from '../infrastructure/entities/agendaInvitation.entity';
import { AgendaProvider } from '../infrastructure/providers/agenda.provider';
import { AgendaInvitationProvider } from '../infrastructure/providers/agendaInvitation.provider';

@Injectable()
export class RsvpUseCase
  extends BaseUseCase
  implements UseCase, OnModuleDestroy
{
  constructor(
    private readonly agendaProvider: AgendaProvider,
    private readonly agendaInvitationProvider: AgendaInvitationProvider,
    private readonly customerProvider: CustomerProvider,
    @InjectQueue(queues.notification.name)
    private readonly notificationQueue: Queue,
  ) {
    super(RsvpUseCase.name);
  }

  async onModuleDestroy() {
    await this.notificationQueue.close();
  }

  async execute(
    customerId: number,
    agendaId: number,
    eventId: number,
    willAttend: boolean,
  ): Promise<DefaultResponseDto> {
    const existsAgenda = await this.agendaProvider.findById(agendaId);

    if (!existsAgenda) {
      throw new DomainNotFound('Agenda not found');
    }

    const existsCustomer = await this.customerProvider.findById(customerId);

    if (!existsCustomer) {
      throw new DomainNotFound('Customer not found');
    }

    const status: AgendaInvitationStatusEnum = willAttend
      ? 'accepted'
      : 'rejected';

    await this.agendaInvitationProvider.updateStatus(eventId, status);

    const queueMessage = createQueueMessage(
      willAttend,
      eventId,
      existsAgenda.artistId,
      customerId,
    );

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

    return DefaultResponse.ok;
  }
}

function createQueueMessage(
  willAttend: boolean,
  eventId: number,
  artistId: number,
  customerId: number,
): RsvpJobType {
  const jobId: 'RSVP_ACCEPTED' | 'RSVP_DECLINED' = willAttend
    ? 'RSVP_ACCEPTED'
    : 'RSVP_DECLINED';

  if (willAttend) {
    return {
      jobId,
      metadata: { eventId, artistId, customerId },
      notificationTypeId: 'EMAIL',
    } as RsvpAcceptedJobType;
  }

  return {
    jobId,
    metadata: { eventId, artistId, customerId },
    notificationTypeId: 'EMAIL',
  } as RsvpDeclinedJobType;
}
