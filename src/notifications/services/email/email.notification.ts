import { Injectable } from '@nestjs/common';
import { MailDataRequired } from '@sendgrid/mail';

import { BaseComponent } from '../../../global/domain/components/base.component';
import { SendGridClient } from '../../clients/sendGrid.client';

import { EmailType } from './schemas/email';
import { TemplateService } from './templates/template.service';

@Injectable()
export class EmailNotificationService extends BaseComponent {
  private readonly from = 'contacto@inker.studio';

  constructor(
    private readonly sendGridClient: SendGridClient,
    private readonly templateService: TemplateService,
  ) {
    super(EmailNotificationService.name);
  }

  /**
   * Sends an email using the SendGrid client.
   * @param email The email data transfer object.
   * @throws Error if the email could not be sent.
   * @throws Error if the email template could not be retrieved.
   */
  async sendEmail(data: EmailType): Promise<void> {
    const { to } = data;
    const { from } = this;
    const { html, subject } = await this.templateService.getContentAndSubject(
      data,
    );

    const mailData: MailDataRequired = {
      to,
      from,
      subject,
      html,
    };

    await this.sendGridClient.send(mailData);
  }
}
