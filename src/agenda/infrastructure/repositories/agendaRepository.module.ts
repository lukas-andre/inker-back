import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AGENDA_DB_CONNECTION_NAME } from '../../../databases/constants';
import { QuotationStateMachine } from '../../domain/quotation.statemachine';
import { Agenda } from '../entities/agenda.entity';
import { AgendaEvent } from '../entities/agendaEvent.entity';
import { Quotation } from '../entities/quotation.entity';
import { QuotationHistory } from '../entities/quotationHistory.entity';

import { AgendaRepository } from './agenda.repository';
import { AgendaEventRepository } from './agendaEvent.repository';
import { QuotationRepository } from './quotation.provider';
import { QuotationOfferRepository } from './quotationOffer.repository';
import { QuotationOffer } from '../entities/quotationOffer.entity';
import { CancellationPenaltyRepository } from './cancellationPenalty.repository';
import { FormTemplateEntity } from '../entities/formTemplate.entity';
import { SignedConsentEntity } from '../entities/signedConsent.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature(
      [Agenda, AgendaEvent, Quotation, QuotationHistory, QuotationOffer, FormTemplateEntity, SignedConsentEntity],
      AGENDA_DB_CONNECTION_NAME,
    ),
  ],
  providers: [
    AgendaRepository,
    AgendaEventRepository,
    QuotationRepository,
    QuotationOfferRepository,
    CancellationPenaltyRepository,
  ],
  exports: [
    AgendaRepository,
    AgendaEventRepository,
    QuotationRepository,
    QuotationOfferRepository,
    CancellationPenaltyRepository,
  ],
})
export class AgendaRepositoryModule {}
