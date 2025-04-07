import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { AppointmentReminderService } from './appointment-reminder.service';
import { AgendaEventProvider } from '../agenda/infrastructure/providers/agendaEvent.provider';
import { AgendaProvider } from '../agenda/infrastructure/providers/agenda.provider';
import { queues } from '../queues/queues';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgendaEvent } from '../agenda/infrastructure/entities/agendaEvent.entity';
import { AGENDA_DB_CONNECTION_NAME } from '../databases/constants';
import { Agenda } from '../agenda/infrastructure/entities/agenda.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    BullModule.registerQueue({
      name: queues.notification.name,
    }),
    TypeOrmModule.forFeature([AgendaEvent, Agenda], AGENDA_DB_CONNECTION_NAME),
  ],
  providers: [
    AppointmentReminderService,
    AgendaEventProvider,
    AgendaProvider,
  ],
  exports: [AppointmentReminderService],
})
export class SchedulerModule {}