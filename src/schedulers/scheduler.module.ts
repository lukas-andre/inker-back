import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

// Jobs
import { EventStateMachineService } from '../agenda/domain/services/eventStateMachine.service';
import { AgendaRepositoryModule } from '../agenda/infrastructure/repositories/agendaRepository.module';
import { ArtistsRepositoryModule } from '../artists/infrastructure/repositories/artistRepository.module';
import { ConsentModule } from '../consent-module/consent.module';
import { queues } from '../queues/queues';
import { ReviewRepositoryModule } from '../reviews/database/reviewRepository.module';

import { ReminderCalculationService } from './domain/services/reminderCalculation.service';
import { AppointmentReminderJob } from './infrastructure/jobs/appointmentReminder.job';
import { ConfirmationCheckerJob } from './infrastructure/jobs/confirmationChecker.job';
import { ConsentReminderJob } from './infrastructure/jobs/consentReminder.job';
import { MonthlyReportJob } from './infrastructure/jobs/monthlyReport.job';
import { ReviewReminderJob } from './infrastructure/jobs/reviewReminder.job';

// Services
import { MonthlyReportAggregatorService } from './infrastructure/services/monthlyReportAggregator.service';

// Repository Modules

// Domain Services

// Consent Module

// Queues

@Module({
  imports: [
    ScheduleModule.forRoot(),
    BullModule.registerQueue({
      name: queues.notification.name,
    }),
    // Repository Modules
    AgendaRepositoryModule,
    ArtistsRepositoryModule,
    ReviewRepositoryModule,
    ConsentModule,
  ],
  providers: [
    // Domain Services
    ReminderCalculationService,
    EventStateMachineService,
    MonthlyReportAggregatorService,

    // Cron Jobs
    AppointmentReminderJob,
    ConsentReminderJob,
    ConfirmationCheckerJob,
    ReviewReminderJob,
    MonthlyReportJob,
  ],
})
export class SchedulerModule {}
