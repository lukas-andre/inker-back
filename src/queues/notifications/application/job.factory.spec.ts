import { createMock } from '@golevelup/ts-jest';
import { Test } from '@nestjs/testing';

import { AgendaEventProvider } from '../../../agenda/infrastructure/providers/agendaEvent.provider';
import { QuotationProvider } from '../../../agenda/infrastructure/providers/quotation.provider';
import { ArtistProvider } from '../../../artists/infrastructure/database/artist.provider';
import { CustomerProvider } from '../../../customers/infrastructure/providers/customer.provider';
import { ArtistLocationProvider } from '../../../locations/infrastructure/database/artistLocation.provider';
import { EmailNotificationService } from '../../../notifications/services/email/email.notification';
import { JobType } from '../domain/schemas/job';

import { JobHandlerFactory } from './job.factory';
import { NotificationJobRegistry } from './job.registry';
import { AgendaEventCanceledJob } from './jobs/agenda/agendaEventCanceled.job';
import { AgendaEventCreatedJob } from './jobs/agenda/agendaEventCreated.job';

describe('JobHandlerFactory', () => {
  let jobHandlerFactory: JobHandlerFactory;
  let emailNotificationService: EmailNotificationService;
  let agendaEventProvider: AgendaEventProvider;
  let artistProvider: ArtistProvider;
  let customerProvider: CustomerProvider;
  let locationProvider: ArtistLocationProvider;
  let quotationProvider: QuotationProvider;
  let jobRegistry: NotificationJobRegistry;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: EmailNotificationService,
          useValue: createMock<EmailNotificationService>(),
        },
        {
          provide: AgendaEventProvider,
          useValue: createMock<AgendaEventProvider>(),
        },
        {
          provide: ArtistProvider,
          useValue: createMock<ArtistProvider>(),
        },
        {
          provide: CustomerProvider,
          useValue: createMock<CustomerProvider>(),
        },
        {
          provide: ArtistLocationProvider,
          useValue: createMock<ArtistLocationProvider>(),
        },
        {
          provide: QuotationProvider,
          useValue: createMock<QuotationProvider>(),
        },
        NotificationJobRegistry,
        JobHandlerFactory,
      ],
    }).compile();

    jobHandlerFactory = module.get<JobHandlerFactory>(JobHandlerFactory);
    emailNotificationService = module.get<EmailNotificationService>(
      EmailNotificationService,
    );
    agendaEventProvider = module.get<AgendaEventProvider>(AgendaEventProvider);
    artistProvider = module.get<ArtistProvider>(ArtistProvider);
    customerProvider = module.get<CustomerProvider>(CustomerProvider);
    locationProvider = module.get<ArtistLocationProvider>(
      ArtistLocationProvider,
    );
    quotationProvider = module.get<QuotationProvider>(QuotationProvider);
    jobRegistry = module.get<NotificationJobRegistry>(NotificationJobRegistry);
  });

  it('should create an AgendaEventCreatedJob instance', () => {
    const job: JobType = {
      jobId: 'EVENT_CREATED',
      metadata: {},
      notificationTypeId: 'EMAIL',
    };
    const jobInstance = jobHandlerFactory.create(job);

    expect(jobInstance).toBeInstanceOf(AgendaEventCreatedJob);
  });

  it('should create an AgendaEventCanceledJob instance', () => {
    const job: JobType = {
      jobId: 'EVENT_CANCELED',
      metadata: {},
      notificationTypeId: 'EMAIL',
    };
    const jobInstance = jobHandlerFactory.create(job);

    expect(jobInstance).toBeInstanceOf(AgendaEventCanceledJob);
  });

  it('should throw an error for unsupported job type', () => {
    const job: JobType = {
      jobId: 'UNSUPPORTED_JOB' as unknown as 'EVENT_CREATED',
      metadata: {},
      notificationTypeId: 'EMAIL',
    };

    expect(() => jobHandlerFactory.create(job)).toThrowError(
      'Job type UNSUPPORTED_JOB not implemented',
    );
  });

  // Add more tests for other job types...
});
