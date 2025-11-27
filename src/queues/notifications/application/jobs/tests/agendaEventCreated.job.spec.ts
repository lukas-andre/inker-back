import { createMock } from '@golevelup/ts-jest';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { AgendaEventRepository } from '../../../../../agenda/infrastructure/repositories/agendaEvent.repository';
import { QuotationRepository } from '../../../../../agenda/infrastructure/repositories/quotation.provider';
import { ArtistRepository } from '../../../../../artists/infrastructure/repositories/artist.repository';
import { sendGridConfig } from '../../../../../config/sendgrid.config';
import { CustomerRepository } from '../../../../../customers/infrastructure/providers/customer.repository';
import { ArtistLocationRepository } from '../../../../../locations/infrastructure/database/artistLocation.repository';
import { SendGridClient } from '../../../../../notifications/clients/sendGrid.client';
import { EmailNotificationService } from '../../../../../notifications/services/email/email.notification';
import { TemplateService } from '../../../../../notifications/services/email/templates/template.service';
import { JobHandlerFactory } from '../../job.factory';
import { NotificationJobRegistry } from '../../job.registry';
import { AgendaEventCreatedJob } from '../agenda/agendaEventCreated.job';

describe('AgendaEventCreatedJob', () => {
  let job: AgendaEventCreatedJob;
  let emailService: EmailNotificationService;
  let mockAgendaEventProvider,
    mockArtistProvider,
    mockCustomerProvider,
    mockLocationProvider;
  let jobHandlerFactory: JobHandlerFactory;
  let templateService: TemplateService;

  beforeEach(async () => {
    mockAgendaEventProvider = {
      findById: jest.fn().mockResolvedValue({
        start: new Date(),
        title: 'Concert',
      }),
    };
    mockArtistProvider = {
      findById: jest.fn().mockResolvedValue({ username: 'John Doe' }),
    };
    mockCustomerProvider = {
      findById: jest.fn().mockResolvedValue({
        contactEmail: 'lucas.henrydz@gmail.com',
        firstName: 'Jane',
      }),
    };
    mockLocationProvider = {
      findOne: jest.fn().mockResolvedValue({
        formattedAddress: '123 Main St',
        lat: 34.05,
        lng: -118.25,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [sendGridConfig],
        }),
      ],
      providers: [
        AgendaEventCreatedJob,
        { provide: AgendaEventRepository, useValue: mockAgendaEventProvider },
        { provide: ArtistRepository, useValue: mockArtistProvider },
        { provide: CustomerRepository, useValue: mockCustomerProvider },
        { provide: ArtistLocationRepository, useValue: mockLocationProvider },
        {
          provide: QuotationRepository,
          useValue: createMock<QuotationRepository>(),
        },
        TemplateService,
        SendGridClient,
        JobHandlerFactory,
        NotificationJobRegistry,
        EmailNotificationService,
      ],
    }).compile();

    jobHandlerFactory = module.get<JobHandlerFactory>(JobHandlerFactory);
    templateService = module.get<TemplateService>(TemplateService);
    emailService = module.get<EmailNotificationService>(
      EmailNotificationService,
    );
    await templateService.onModuleInit();
  });

  it('should send an email with the correct data when an event is created', async () => {
    const sendEmailSpy = jest.spyOn(emailService, 'sendEmail');

    const jobMetadata = { artistId: 1, customerId: 1, eventId: 1 };
    const job = jobHandlerFactory.create({
      jobId: 'EVENT_CREATED',
      metadata: jobMetadata,
      notificationTypeId: 'EMAIL',
    });
    await job.handle({ metadata: jobMetadata });

    expect(mockAgendaEventProvider.findById).toHaveBeenCalledWith(1);
    expect(mockArtistProvider.findById).toHaveBeenCalledWith(1);
    expect(mockCustomerProvider.findById).toHaveBeenCalledWith(1);
    expect(mockLocationProvider.findOne).toHaveBeenCalledWith({
      where: { artistId: 1 },
    });

    expect(sendEmailSpy).toHaveBeenCalledWith({
      to: 'lucas.henrydz@gmail.com',
      artistName: 'John Doe',
      customerName: 'Jane',
      eventLocation: '123 Main St',
      googleMapsLink:
        'https://www.google.com/maps/@?api=1&map_action=map&center=34.05%2C-118.25',
      eventDate: expect.any(Date),
      eventName: 'Concert',
      mailId: 'EVENT_CREATED',
    });
  });
});
