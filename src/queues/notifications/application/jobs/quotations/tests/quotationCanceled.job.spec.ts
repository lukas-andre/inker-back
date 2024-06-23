import { createMock } from '@golevelup/ts-jest';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { AgendaEventProvider } from '../../../../../../agenda/infrastructure/providers/agendaEvent.provider';
import { QuotationProvider } from '../../../../../../agenda/infrastructure/providers/quotation.provider';
import { ArtistProvider } from '../../../../../../artists/infrastructure/database/artist.provider';
import { sendGridConfig } from '../../../../../../config/sendgrid.config';
import { CustomerProvider } from '../../../../../../customers/infrastructure/providers/customer.provider';
import { ArtistLocationProvider } from '../../../../../../locations/infrastructure/database/artistLocation.provider';
import { SendGridClient } from '../../../../../../notifications/clients/sendGrid.client';
import { EmailNotificationService } from '../../../../../../notifications/services/email/email.notification';
import { TemplateService } from '../../../../../../notifications/services/email/templates/template.service';
import { JobHandlerFactory } from '../../../job.factory';
import { NotificationJobRegistry } from '../../../job.registry';
import { QuotationCanceledJob } from '../quotationCanceled.job';

describe('QuotationCanceledJob', () => {
  let job: QuotationCanceledJob;
  let emailService: EmailNotificationService;
  let mockQuotationProvider, mockArtistProvider, mockCustomerProvider;
  let jobHandlerFactory: JobHandlerFactory;
  let templateService: TemplateService;

  beforeEach(async () => {
    mockQuotationProvider = {
      findById: jest.fn().mockResolvedValue({
        estimatedCost: 150,
        appointmentDate: new Date(),
        appointmentDuration: 60,
        canceledReason: 'customer',
      }),
    };
    mockArtistProvider = {
      findById: jest.fn().mockResolvedValue({
        username: 'John Doe',
        contact: { email: 'lucas.henrydz@gmail.com' },
      }),
    };
    mockCustomerProvider = {
      findById: jest.fn().mockResolvedValue({
        firstName: 'Jane',
        contactEmail: 'lucas.henrydz@gmail.com',
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
        QuotationCanceledJob,
        {
          provide: AgendaEventProvider,
          useValue: createMock<AgendaEventProvider>(),
        },
        { provide: QuotationProvider, useValue: mockQuotationProvider },
        { provide: ArtistProvider, useValue: mockArtistProvider },
        { provide: CustomerProvider, useValue: mockCustomerProvider },
        {
          provide: ArtistLocationProvider,
          useValue: createMock<ArtistLocationProvider>(),
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

  it('should send an email with the correct data when a quotation is canceled', async () => {
    const sendEmailSpy = jest.spyOn(emailService, 'sendEmail');

    const jobMetadata = { artistId: 1, customerId: 1, quotationId: 1 };
    const job = jobHandlerFactory.create({
      jobId: 'QUOTATION_CANCELED',
      metadata: jobMetadata,
      notificationTypeId: 'EMAIL',
    });
    await job.handle({ metadata: jobMetadata });

    expect(mockQuotationProvider.findById).toHaveBeenCalledWith(1);
    expect(mockArtistProvider.findById).toHaveBeenCalledWith(1);
    expect(mockCustomerProvider.findById).toHaveBeenCalledWith(1);

    expect(sendEmailSpy).toHaveBeenCalledWith({
      to: 'lucas.henrydz@gmail.com',
      artistName: 'John Doe',
      customerName: 'Jane',
      cancelationReason: 'customer',
      mailId: 'QUOTATION_CANCELED',
    });
  });
});
