import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgendaService } from './domain/agenda.service';
import { AgendaEventService } from './domain/agendaEvent.service';
import { AgendaController } from './intrastructure/agenda.controller';
import { AgendaHandler } from './intrastructure/agenda.handler';
import { Agenda } from './intrastructure/entities/agenda.entity';
import { AgendaEvent } from './intrastructure/entities/agendaEvent.entity';
import { AddEventUseCase } from './usecases/addEvent.usecase';
import { CancelEventUseCase } from './usecases/cancelEvent.usecase';
import { FindEventByAgendaIdAndEventIdUseCase } from './usecases/findEventByAgendaIdAndEventId.usecase';
import { ListEventByViewTypeUseCase } from './usecases/listEventByViewType.usecase';
import { UpdateEventUseCase } from './usecases/updateEvent.usecase';

@Module({
  imports: [TypeOrmModule.forFeature([Agenda, AgendaEvent], 'agenda-db')],
  providers: [
    AgendaService,
    AgendaHandler,
    AgendaEventService,
    AddEventUseCase,
    UpdateEventUseCase,
    CancelEventUseCase,
    ListEventByViewTypeUseCase,
    FindEventByAgendaIdAndEventIdUseCase,
  ],
  controllers: [AgendaController],
  exports: [AgendaService],
})
export class AgendaModule {}
