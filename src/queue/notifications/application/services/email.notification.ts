import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { MailDataRequired, default as SendGrid } from '@sendgrid/mail';

import { sendGridConfig } from '../../../../config/sendgrid.config';
import { BaseComponent } from '../../../../global/domain/components/base.component';
import { SendGridClient } from '../../../../notifications/clients/sendGrid.client';
import {
  CustomerNotification,
  INotificationService,
} from '../../domain/notificiation.service';

@Injectable()
export class EmailNotificationService
  extends BaseComponent
  implements INotificationService
{
  constructor(private sendGridClient: SendGridClient) {
    super(EmailNotificationService.name);
  }

  // This email notification service should receive a template and a dto related to the template
  async sendCustomerNotification(payload: CustomerNotification): Promise<void> {
    console.log(
      `Sending email to ${payload.customerId} with template ${payload.template}`,
    );

    const mailData: MailDataRequired = {
      to: 'lucas.henrydz@gmail.com',
      from: 'contacto@inker.studio',
      subject: 'Inker Studio Test Email',
      content: [
        {
          type: 'text/plain',
          value: payload.message,
        },
      ],
    };
    try {
      const response = this.sendGridClient.send(mailData);
      this.logger.log(
        `Email successfully dispatched to ${mailData.to as string}`,
      );
      this.logger.debug(response);
    } catch (error) {
      //You can do more with the error
      this.logger.error('Error while sending email', error);
      throw error;
    }
  }
}
