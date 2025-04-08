import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { AppointmentReminderService } from './appointment-reminder.service';
import { AgendaEventRepository } from '../agenda/infrastructure/repositories/agendaEvent.repository';
import { AgendaRepository } from '../agenda/infrastructure/repositories/agenda.repository';
import { queues } from '../queues/queues';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agenda } from '../agenda/infrastructure/entities/agenda.entity';
import { AgendaEvent } from '../agenda/infrastructure/entities/agendaEvent.entity';
import { AGENDA_DB_CONNECTION_NAME } from '../databases/constants';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    BullModule.registerQueue({
      name: queues.notification.name,
    }),
    TypeOrmModule.forFeature([AgendaEvent, Agenda], AGENDA_DB_CONNECTION_NAME),
    // AgendaRepositoryModule
  ],
  providers: [
    AppointmentReminderService,
    AgendaEventRepository,
    AgendaRepository,
  ],
  exports: [AppointmentReminderService],
})
export class SchedulerModule {}