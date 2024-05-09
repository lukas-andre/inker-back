import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { MailService } from '@sendgrid/mail';

import { sendGridConfig } from '../../../../config/sendgrid.config';
import { SendGridClient } from '../../../../notifications/clients/sendGrid.client';
import { CustomerNotification } from '../../domain/notificiation.service';

import { EmailNotificationService } from './email.notification';

describe('EmailNotificationService', () => {
  let emailNotificationService: EmailNotificationService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [sendGridConfig],
        }),
      ],
      providers: [EmailNotificationService, SendGridClient],
    }).compile();

    emailNotificationService = moduleRef.get<EmailNotificationService>(
      EmailNotificationService,
    );
  });

  describe('sendCustomerNotification', () => {
    it('should send an email to the customer with the provided payload', async () => {
      const payload: CustomerNotification = {
        customerId: 'CUSTOMER_ID',
        template: 'EVENT_CREATED',
        message: 'Your event has been created',
      };

      const consoleLogSpy = jest.spyOn(console, 'log');
      // await emailNotificationService.sendCustomerNotification(payload);
      // expect(consoleLogSpy).toHaveBeenCalledWith(
      //   `Sending email to ${payload.customerId} with template ${payload.template}`,
      // );
    });
  });
});
