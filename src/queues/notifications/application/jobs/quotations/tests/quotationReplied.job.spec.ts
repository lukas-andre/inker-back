import { createMock } from '@golevelup/ts-jest';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { AgendaEventRepository } from '../../../../../../agenda/infrastructure/repositories/agendaEvent.repository';
import { QuotationRepository } from '../../../../../../agenda/infrastructure/repositories/quotation.provider';
import { ArtistRepository } from '../../../../../../artists/infrastructure/repositories/artist.repository';
import { sendGridConfig } from '../../../../../../config/sendgrid.config';
import { CustomerRepository } from '../../../../../../customers/infrastructure/providers/customer.repository';
import { ArtistLocationRepository } from '../../../../../../locations/infrastructure/database/artistLocation.repository';
import { SendGridClient } from '../../../../../../notifications/clients/sendGrid.client';
import { EmailNotificationService } from '../../../../../../notifications/services/email/email.notification';
import { TemplateService } from '../../../../../../notifications/services/email/templates/template.service';
import { JobHandlerFactory } from '../../../job.factory';
import { NotificationJobRegistry } from '../../../job.registry';
import { QuotationRepliedJob } from '../quotationReplied.job';

describe('QuotationRepliedJob', () => {
  let job: QuotationRepliedJob;
  let emailService: EmailNotificationService;
  let mockQuotationProvider, mockArtistProvider, mockCustomerProvider;
  let jobHandlerFactory: JobHandlerFactory;
  let templateService: TemplateService;

  beforeEach(async () => {
    mockQuotationProvider = {
      findById: jest.fn().mockResolvedValue({
        estimatedCost: 200,
        appointmentDate: new Date(),
        appointmentDuration: 90,
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
        QuotationRepliedJob,
        {
          provide: AgendaEventRepository,
          useValue: createMock<AgendaEventRepository>(),
        },
        { provide: QuotationRepository, useValue: mockQuotationProvider },
        { provide: ArtistRepository, useValue: mockArtistProvider },
        { provide: CustomerRepository, useValue: mockCustomerProvider },
        {
          provide: ArtistLocationRepository,
          useValue: createMock<ArtistLocationRepository>(),
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

  it('should send an email with the correct data when a quotation is replied', async () => {
    const sendEmailSpy = jest.spyOn(emailService, 'sendEmail');

    const jobMetadata = { artistId: 1, customerId: 1, quotationId: 1 };
    const job = jobHandlerFactory.create({
      jobId: 'QUOTATION_REPLIED',
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
      estimatedCost: 200,
      appointmentDate: expect.any(Date),
      appointmentDuration: 90,
      mailId: 'QUOTATION_REPLIED',
    });
  });
});
