import { Injectable } from '@nestjs/common';

import { CustomerProvider } from '../../customers/infrastructure/providers/customer.provider';
import {
  DomainBadRule,
  DomainNotFound,
} from '../../global/domain/exceptions/domain.exception';
import {
  BaseUseCase,
  UseCase,
} from '../../global/domain/usecases/base.usecase';
import { AddEventReqDto } from '../infrastructure/dtos/addEventReq.dto';
import { AgendaEvent } from '../infrastructure/entities/agendaEvent.entity';
import { AgendaProvider } from '../infrastructure/providers/agenda.provider';
import { AgendaEventProvider } from '../infrastructure/providers/agendaEvent.provider';

@Injectable()
export class AddEventUseCase extends BaseUseCase implements UseCase {
  constructor(
    private readonly agendaProvider: AgendaProvider,
    private readonly agendaEventProvider: AgendaEventProvider,
    private readonly customerProvider: CustomerProvider,
  ) {
    super(AddEventUseCase.name);
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

    const transactionResult =
      await this.agendaProvider.createEventAndInvitationTransaction({
        agendaId: existsAgenda.id,
        customerId: existsCustomer.id,
        start: addEventDto.start,
        end: addEventDto.end,
        color: addEventDto.color,
        info: addEventDto.info,
        notification: addEventDto.notification,
        title: addEventDto.title,
      });

    if (!transactionResult) {
      throw new DomainBadRule('Error creating event');
    }
  }
}
