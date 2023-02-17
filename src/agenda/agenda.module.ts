import { Module } from '@nestjs/common';

import { CustomerProviderModule } from '../customers/infrastructure/providers/customerProvider.module';
import { MultimediasModule } from '../multimedias/multimedias.module';
import { UserProviderModule } from '../users/infrastructure/providers/userProvider.module';

import { AgendaController } from './infrastructure/agenda.controller';
import { AgendaHandler } from './infrastructure/agenda.handler';
import { AgendaProviderModule } from './infrastructure/providers/agendaProvider.module';
import { AddEventUseCase } from './usecases/addEvent.usecase';
import { CancelEventUseCase } from './usecases/cancelEvent.usecase';
import { FindEventByAgendaIdAndEventIdUseCase } from './usecases/findEventByAgendaIdAndEventId.usecase';
import { ListEventByViewTypeUseCase } from './usecases/listEventByViewType.usecase';
import { MarkEventAsDoneUseCase } from './usecases/markEventAsDone.usecase';
import { UpdateEventUseCase } from './usecases/updateEvent.usecase';

@Module({
  imports: [
    AgendaProviderModule,
    UserProviderModule,
    CustomerProviderModule,
    MultimediasModule,
  ],
  providers: [
    AgendaHandler,
    AddEventUseCase,
    UpdateEventUseCase,
    CancelEventUseCase,
    ListEventByViewTypeUseCase,
    FindEventByAgendaIdAndEventIdUseCase,
    MarkEventAsDoneUseCase,
  ],
  controllers: [AgendaController],
})
export class AgendaModule {}
