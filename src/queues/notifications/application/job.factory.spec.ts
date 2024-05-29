import { getQueueToken } from '@nestjs/bull';
import { Test, TestingModule } from '@nestjs/testing';
import { Queue } from 'bull';

import { AgendaEventProvider } from '../../../agenda/infrastructure/providers/agendaEvent.provider';
import { ArtistProvider } from '../../../artists/infrastructure/database/artist.provider';
import { CustomerProvider } from '../../../customers/infrastructure/providers/customer.provider';
import { ArtistLocationProvider } from '../../../locations/infrastructure/database/artistLocation.provider';
import { EmailNotificationService } from '../../../notifications/services/email/email.notification';
import { JobType } from '../domain/schemas/job';

import { AgendaEventCanceledJob } from './agenda-jobs/agendaEventCanceled.job';
import { AgendaEventCreatedJob } from './agenda-jobs/agendaEventCreated.job';
import { AgendaJobRegistry } from './agenda-jobs/agendaJob.registry';
import { JobHandlerFactory } from './job.factory';

describe('JobHandlerFactory', () => {
  let jobHandlerFactory: JobHandlerFactory;
  let emailNotificationService: EmailNotificationService;
  let agendaEventProvider: AgendaEventProvider;
  let artistProvider: ArtistProvider;
  let customerProvider: CustomerProvider;
  let locationProvider: ArtistLocationProvider;
  let jobRegistry: AgendaJobRegistry;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailNotificationService,
        AgendaEventProvider,
        ArtistProvider,
        CustomerProvider,
        ArtistLocationProvider,
        AgendaJobRegistry,
        JobHandlerFactory,
      ],
    })
      .overrideProvider(EmailNotificationService)
      .useValue(jest.fn())
      .overrideProvider(AgendaEventProvider)
      .useValue(jest.fn())
      .overrideProvider(ArtistProvider)
      .useValue(jest.fn())
      .overrideProvider(CustomerProvider)
      .useValue(jest.fn())
      .overrideProvider(ArtistLocationProvider)
      .useValue(jest.fn())
      .compile();

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
    jobRegistry = module.get<AgendaJobRegistry>(AgendaJobRegistry);
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
