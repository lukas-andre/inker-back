import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';

// Jobs
import { AppointmentReminderJob } from './infrastructure/jobs/appointmentReminder.job';
import { ConsentReminderJob } from './infrastructure/jobs/consentReminder.job';
import { ConfirmationCheckerJob } from './infrastructure/jobs/confirmationChecker.job';
import { ReviewReminderJob } from './infrastructure/jobs/reviewReminder.job';
import { MonthlyReportJob } from './infrastructure/jobs/monthlyReport.job';

// Services
import { ReminderCalculationService } from './domain/services/reminderCalculation.service';
import { MonthlyReportAggregatorService } from './infrastructure/services/monthlyReportAggregator.service';

// Repository Modules
import { AgendaRepositoryModule } from '../agenda/infrastructure/repositories/agendaRepository.module';
import { ArtistsRepositoryModule } from '../artists/infrastructure/repositories/artistRepository.module';
import { ReviewRepositoryModule } from '../reviews/database/reviewRepository.module';

// Domain Services
import { EventStateMachineService } from '../agenda/domain/services/eventStateMachine.service';

// Consent Module
import { ConsentModule } from '../consent-module/consent.module';

// Queues
import { queues } from '../queues/queues';

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