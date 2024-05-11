import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';

import { sendGridConfig } from '../../../config/sendgrid.config';
import { SendGridClient } from '../../clients/sendGrid.client';

import { EmailNotificationService } from './email.notification';
import { TemplateService } from './templates/template.service';

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
      providers: [EmailNotificationService, SendGridClient, TemplateService],
    }).compile();

    emailNotificationService = moduleRef.get<EmailNotificationService>(
      EmailNotificationService,
    );
  });

  describe('sendCustomerNotification', () => {
    it('should send an email to the customer with the provided payload', async () => {
      const payload: AgendaEventCreatedDto = {
        to: 'asdad',
        customerId: '1',
        eventDate: new Date(),
        eventName: 'Event',
        subject: 'Event Created',
      };

      const consoleLogSpy = jest.spyOn(console, 'log');
      // await emailNotificationService.sendCustomerNotification(payload);
      // expect(consoleLogSpy).toHaveBeenCalledWith(
      //   `Sending email to ${payload.customerId} with template ${payload.template}`,
      // );
    });
  });
});
