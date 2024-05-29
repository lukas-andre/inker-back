import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AGENDA_DB_CONNECTION_NAME } from '../../../databases/constants';
import { Agenda } from '../entities/agenda.entity';
import { AgendaEvent } from '../entities/agendaEvent.entity';
import { AgendaInvitation } from '../entities/agendaInvitation.entity';

import { AgendaProvider } from './agenda.provider';
import { AgendaEventProvider } from './agendaEvent.provider';
import { AgendaInvitationProvider } from './agendaInvitation.provider';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [Agenda, AgendaEvent, AgendaInvitation],
      AGENDA_DB_CONNECTION_NAME,
    ),
  ],
  providers: [AgendaProvider, AgendaEventProvider, AgendaInvitationProvider],
  exports: [AgendaProvider, AgendaEventProvider, AgendaInvitationProvider],
})
export class AgendaProviderModule {}
