import { Injectable } from '@nestjs/common';

import { AgendaEventProvider } from '../../../agenda/infrastructure/providers/agendaEvent.provider';
import { QuotationProvider } from '../../../agenda/infrastructure/providers/quotation.provider';
import { ArtistProvider } from '../../../artists/infrastructure/database/artist.provider';
import { CustomerProvider } from '../../../customers/infrastructure/providers/customer.provider';
import { ArtistLocationProvider } from '../../../locations/infrastructure/database/artistLocation.provider';
import { EmailNotificationService } from '../../../notifications/services/email/email.notification';
import { NotificationStorageService } from '../../../notifications/services/notification.storage';
import { JobType } from '../domain/schemas/job';

import { NotificationJobRegistry } from './job.registry';
import { NotificationJob } from './jobs/notification.job';
import { PushNotificationService } from '../../../notifications/services/push/pushNotification.service';

@Injectable()
export class JobHandlerFactory {
  constructor(
    private readonly emailNotificationService: EmailNotificationService,
    private readonly agendaEventProvider: AgendaEventProvider,
    private readonly artistProvider: ArtistProvider,
    private readonly customerProvider: CustomerProvider,
    private readonly locationProvider: ArtistLocationProvider,
    private readonly quotationProvider: QuotationProvider,
    private readonly pushNotificationService: PushNotificationService,
    private readonly notificationStorageService: NotificationStorageService,
    private readonly notificationJobRegistry: NotificationJobRegistry,
  ) {}

  create(job: JobType): NotificationJob {
    const JobClass = this.notificationJobRegistry.getJobConstructor(job.jobId);

    if (!JobClass) {
      throw new Error(`Job type ${job.jobId} not implemented`);
    }

    return new JobClass(
      this.emailNotificationService,
      this.agendaEventProvider,
      this.artistProvider,
      this.customerProvider,
      this.locationProvider,
      this.quotationProvider,
      this.pushNotificationService,
      this.notificationStorageService,
    );
  }
}
