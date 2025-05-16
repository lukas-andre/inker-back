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
import { QuotationOfferRepository } from './quotationOffer.repository';
import { QuotationOffer } from '../entities/quotationOffer.entity';
import { CancellationPenaltyRepository } from './cancellationPenalty.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [Agenda, AgendaEvent, AgendaInvitation, Quotation, QuotationHistory, QuotationOffer],
      AGENDA_DB_CONNECTION_NAME,
    ),
  ],
  providers: [
    AgendaRepository,
    AgendaEventRepository,
    AgendaInvitationRepository,
    QuotationRepository,
    QuotationOfferRepository,
    CancellationPenaltyRepository,
  ],
  exports: [
    AgendaRepository,
    AgendaEventRepository,
    AgendaInvitationRepository,
    QuotationRepository,
    QuotationOfferRepository,
    CancellationPenaltyRepository,
  ],
})
export class AgendaRepositoryModule {}
