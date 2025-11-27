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
import { QuotationCanceledJobType } from '../../../../domain/schemas/quotation';
import { JobHandlerFactory } from '../../../job.factory';
import { NotificationJobRegistry } from '../../../job.registry';
import { QuotationCanceledJob } from '../quotationCanceled.job';

describe('QuotationCanceledJob', () => {
  let jobHandlerFactory: JobHandlerFactory;
  let emailService: EmailNotificationService;
  let templateService: TemplateService;
  let mockQuotationProvider, mockArtistProvider, mockCustomerProvider;

  beforeEach(async () => {
    mockQuotationProvider = {
      findById: jest.fn().mockResolvedValue({
        estimatedCost: 150,
        appointmentDate: new Date(),
        appointmentDuration: 60,
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
        { provide: QuotationRepository, useValue: mockQuotationProvider },
        { provide: ArtistRepository, useValue: mockArtistProvider },
        { provide: CustomerRepository, useValue: mockCustomerProvider },
        {
          provide: AgendaEventRepository,
          useValue: createMock<AgendaEventRepository>(),
        },
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
    emailService = module.get<EmailNotificationService>(
      EmailNotificationService,
    );
    templateService = module.get<TemplateService>(TemplateService);
    await templateService.onModuleInit();
  });

  it('should send an email when a customer cancels a quotation', async () => {
    const sendEmailSpy = jest.spyOn(emailService, 'sendEmail');

    const jobData: QuotationCanceledJobType = {
      jobId: 'QUOTATION_CANCELED',
      notificationTypeId: 'EMAIL',
      metadata: {
        artistId: 1,
        customerId: 1,
        quotationId: 1,
        cancelReasonType: 'customer' as 'artist' | 'customer' | 'system',
        cancelReason: 'change_of_mind',
        cancelReasonDetails: 'Changed project plans',
        canceledBy: 'customer' as 'artist' | 'customer' | 'system',
      },
    };
    const job = jobHandlerFactory.create(jobData);
    await job.handle({ metadata: jobData.metadata });

    expect(mockQuotationProvider.findById).toHaveBeenCalledWith(1);
    expect(mockArtistProvider.findById).toHaveBeenCalledWith(1);
    expect(mockCustomerProvider.findById).toHaveBeenCalledWith(1);

    expect(sendEmailSpy).toHaveBeenCalledWith({
      to: 'lucas.henrydz@gmail.com',
      artistName: 'John Doe',
      customerName: 'Jane',
      cancelMessage:
        'The customer has canceled the quotation due to: Change of mind Additional details: Changed project plans',
      canceledBy: 'customer',
      mailId: 'QUOTATION_CANCELED',
    });
  });

  it('should send an email when an artist cancels a quotation', async () => {
    const sendEmailSpy = jest.spyOn(emailService, 'sendEmail');

    const jobMetadata = {
      artistId: 1,
      customerId: 1,
      quotationId: 1,
      cancelReasonType: 'artist',
      cancelReason: 'scheduling_conflict',
      cancelReasonDetails: 'Unexpected travel',
      canceledBy: 'artist',
    };
    const job = jobHandlerFactory.create({
      jobId: 'QUOTATION_CANCELED',
      metadata: jobMetadata,
      notificationTypeId: 'EMAIL',
    } as QuotationCanceledJobType);
    await job.handle({ metadata: jobMetadata });

    expect(sendEmailSpy).toHaveBeenCalledWith({
      to: 'lucas.henrydz@gmail.com',
      artistName: 'John Doe',
      customerName: 'Jane',
      cancelMessage:
        'The artist has canceled the quotation due to: Scheduling conflict Additional details: Unexpected travel',
      canceledBy: 'artist',
      mailId: 'QUOTATION_CANCELED',
    });
  });

  it('should send an email when the system cancels a quotation', async () => {
    const sendEmailSpy = jest.spyOn(emailService, 'sendEmail');

    const jobMetadata = {
      artistId: 1,
      customerId: 1,
      quotationId: 1,
      cancelReasonType: 'system',
      cancelReason: 'not_attended',
      canceledBy: 'system',
    };
    const job = jobHandlerFactory.create({
      jobId: 'QUOTATION_CANCELED',
      metadata: jobMetadata,
      notificationTypeId: 'EMAIL',
    } as QuotationCanceledJobType);
    await job.handle({ metadata: jobMetadata });

    expect(sendEmailSpy).toHaveBeenCalledWith({
      to: 'lucas.henrydz@gmail.com',
      artistName: 'John Doe',
      customerName: 'Jane',
      cancelMessage:
        'The quotation has been automatically canceled due to: Not attended',
      canceledBy: 'system',
      mailId: 'QUOTATION_CANCELED',
    });
  });
});
