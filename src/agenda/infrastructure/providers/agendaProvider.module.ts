import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Agenda } from '../entities/agenda.entity';
import { AgendaEvent } from '../entities/agendaEvent.entity';

import { AgendaProvider } from './agenda.provider';
import { AgendaEventProvider } from './agendaEvent.provider';

@Module({
  imports: [TypeOrmModule.forFeature([Agenda, AgendaEvent], 'agenda-db')],
  providers: [AgendaProvider, AgendaEventProvider],
  exports: [AgendaProvider, AgendaEventProvider],
})
export class AgendaProviderModule {}
