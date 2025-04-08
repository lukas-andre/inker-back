import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AGENDA_DB_CONNECTION_NAME } from '../../../databases/constants';
import { QuotationStateMachine } from '../../domain/quotation.statemachine';
import { Agenda } from '../entities/agenda.entity';
import { AgendaEvent } from '../entities/agendaEvent.entity';
import { AgendaInvitation } from '../entities/agendaInvitation.entity';
import { Quotation } from '../entities/quotation.entity';
import { QuotationHistory } from '../entities/quotationHistory.entity';

import { AgendaRepository } from './agenda.repository';
import { AgendaEventRepository } from './agendaEvent.repository';
import { AgendaInvitationRepository } from './agendaInvitation.provider';
import { QuotationRepository } from './quotation.provider';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [Agenda, AgendaEvent, AgendaInvitation, Quotation, QuotationHistory],
      AGENDA_DB_CONNECTION_NAME,
    ),
  ],
  providers: [
    AgendaRepository,
    AgendaEventRepository,
    AgendaInvitationRepository,
    QuotationRepository,
  ],
  exports: [
    AgendaRepository,
    AgendaEventRepository,
    AgendaInvitationRepository,
    QuotationRepository,
  ],
})
export class AgendaRepositoryModule {}
