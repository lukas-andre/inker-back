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
import { queues } from '../../../queues/queues';
import { AddEventReqDto } from '../../infrastructure/dtos/addEventReq.dto';
import { AgendaRepository } from '../../infrastructure/repositories/agenda.repository';
import { AgendaEventRepository } from '../../infrastructure/repositories/agendaEvent.repository';
import { CreateAgendaEventService } from '../../domain/services/createAgendaEvent.service';
import { EventStateMachineService, AgendaEventTransition, StateMachineContext } from '../../domain/services/eventStateMachine.service';
import { AgendaEventStatus } from '../../domain/enum/agendaEventStatus.enum';
import { UserType } from '../../../users/domain/enums/userType.enum';

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
    private readonly eventStateMachineService: EventStateMachineService,
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

    const result = await this.createAgendaEventService.createDirectEvent(
      existsAgenda.id,
      existsCustomer.id,
      addEventDto.title,
      addEventDto.info,
      addEventDto.color,
      new Date(addEventDto.start),
      new Date(addEventDto.end),
      { 
        userId: existsAgenda.artistId,
        roleId: existsAgenda.artistId, 
        role: UserType.ARTIST 
      },
      AgendaEventStatus.CREATED,
      'Event created directly by artist via AddEventUseCase.'
    );

    if (!result.transactionIsOK || !result.eventId) {
      throw new DomainBadRule('Error creating event');
    }
    
    const eventEntity = await this.agendaEventProvider.repo.findOne({
      where: { id: result.eventId },
      relations: ['agenda'],
    });
    
    if (!eventEntity) {
      this.logger.error(`Failed to find newly created event ${result.eventId} for state transition.`);
      throw new DomainNotFound('Newly created event not found for state transition');
    }

    const eventContext: StateMachineContext = {
      eventEntity: eventEntity,
      actor: {
        userId: existsAgenda.artistId,
        roleId: existsAgenda.artistId,
        role: UserType.ARTIST,
      },
      payload: {
        notes: 'Event created directly by artist; confirmation automatically requested.',
      }
    };

    try {
      const newStatus = await this.eventStateMachineService.transition(
        AgendaEventStatus.CREATED,
        AgendaEventTransition.REQUEST_CONFIRMATION,
        eventContext,
      );
      this.logger.log(`Event ${result.eventId} transitioned from CREATED to ${newStatus} via request_confirmation.`);
    } catch (error) {
      this.logger.error(`Error transitioning event ${result.eventId} after creation:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during state transition';
      throw new DomainBadRule(`Error transitioning event to pending confirmation: ${errorMessage}`);
    }
  }
}
