import { Injectable } from '@nestjs/common';

import { AgendaEventProvider } from '../../../agenda/infrastructure/providers/agendaEvent.provider';
import { ArtistProvider } from '../../../artists/infrastructure/database/artist.provider';
import { CustomerProvider } from '../../../customers/infrastructure/providers/customer.provider';
import { ArtistLocationProvider } from '../../../locations/infrastructure/database/artistLocation.provider';
import { EmailNotificationService } from '../../../notifications/services/email/email.notification';
import { JobType } from '../domain/schemas/job';

import { NotificationJob } from './agenda-jobs/agendaEvent.job';
import { NotificationJobRegistry } from './agenda-jobs/agendaJob.registry';

@Injectable()
export class JobHandlerFactory {
  constructor(
    private readonly emailNotificationService: EmailNotificationService,
    private readonly agendaEventProvider: AgendaEventProvider,
    private readonly artistProvider: ArtistProvider,
    private readonly customerProvider: CustomerProvider,
    private readonly locationProvider: ArtistLocationProvider,
    private readonly agendaJobRegistry: NotificationJobRegistry,
  ) {}

  create(job: JobType): NotificationJob {
    const JobClass = this.agendaJobRegistry.getJobConstructor(job.jobId);

    if (!JobClass) {
      throw new Error(`Job type ${job.jobId} not implemented`);
    }

    return new JobClass(
      this.emailNotificationService,
      this.agendaEventProvider,
      this.artistProvider,
      this.customerProvider,
      this.locationProvider,
    );
  }
}
