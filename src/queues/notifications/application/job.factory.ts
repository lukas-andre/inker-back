import { Injectable } from '@nestjs/common';

import { AgendaEventRepository } from '../../../agenda/infrastructure/repositories/agendaEvent.repository';
import { QuotationRepository } from '../../../agenda/infrastructure/repositories/quotation.provider';
import { ArtistRepository } from '../../../artists/infrastructure/repositories/artist.repository';
import { CustomerRepository } from '../../../customers/infrastructure/providers/customer.repository';
import { ArtistLocationRepository } from '../../../locations/infrastructure/database/artistLocation.repository';
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
    private readonly agendaEventProvider: AgendaEventRepository,
    private readonly artistProvider: ArtistRepository,
    private readonly customerProvider: CustomerRepository,
    private readonly locationProvider: ArtistLocationRepository,
    private readonly quotationProvider: QuotationRepository,
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
