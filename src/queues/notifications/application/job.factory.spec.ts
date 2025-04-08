import { createMock } from '@golevelup/ts-jest';
import { Test } from '@nestjs/testing';

import { AgendaEventRepository } from '../../../agenda/infrastructure/repositories/agendaEvent.repository';
import { QuotationRepository } from '../../../agenda/infrastructure/repositories/quotation.provider';
import { ArtistRepository } from '../../../artists/infrastructure/repositories/artist.repository';
import { CustomerRepository } from '../../../customers/infrastructure/providers/customer.repository';
import { ArtistLocationRepository } from '../../../locations/infrastructure/database/artistLocation.repository';
import { EmailNotificationService } from '../../../notifications/services/email/email.notification';
import { JobType } from '../domain/schemas/job';

import { JobHandlerFactory } from './job.factory';
import { NotificationJobRegistry } from './job.registry';
import { AgendaEventCanceledJob } from './jobs/agenda/agendaEventCanceled.job';
import { AgendaEventCreatedJob } from './jobs/agenda/agendaEventCreated.job';

describe('JobHandlerFactory', () => {
  let jobHandlerFactory: JobHandlerFactory;
  let emailNotificationService: EmailNotificationService;
  let agendaEventProvider: AgendaEventRepository;
  let artistProvider: ArtistRepository;
  let customerProvider: CustomerRepository;
  let locationProvider: ArtistLocationRepository;
  let quotationProvider: QuotationRepository;
  let jobRegistry: NotificationJobRegistry;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: EmailNotificationService,
          useValue: createMock<EmailNotificationService>(),
        },
        {
          provide: AgendaEventRepository,
          useValue: createMock<AgendaEventRepository>(),
        },
        {
          provide: ArtistRepository,
          useValue: createMock<ArtistRepository>(),
        },
        {
          provide: CustomerRepository,
          useValue: createMock<CustomerRepository>(),
        },
        {
          provide: ArtistLocationRepository,
          useValue: createMock<ArtistLocationRepository>(),
        },
        {
          provide: QuotationRepository,
          useValue: createMock<QuotationRepository>(),
        },
        NotificationJobRegistry,
        JobHandlerFactory,
      ],
    }).compile();

    jobHandlerFactory = module.get<JobHandlerFactory>(JobHandlerFactory);
    emailNotificationService = module.get<EmailNotificationService>(
      EmailNotificationService,
    );
    agendaEventProvider = module.get<AgendaEventRepository>(AgendaEventRepository);
    artistProvider = module.get<ArtistRepository>(ArtistRepository);
    customerProvider = module.get<CustomerRepository>(CustomerRepository);
    locationProvider = module.get<ArtistLocationRepository>(
      ArtistLocationRepository,
    );
    quotationProvider = module.get<QuotationRepository>(QuotationRepository);
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
