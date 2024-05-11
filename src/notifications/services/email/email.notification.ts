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
    const { content, subject } =
      await this.templateService.getContentAndSubject(data);

    const mailData: MailDataRequired = this.createMailData(
      data,
      subject,
      content,
    );

    try {
      const response = await this.sendGridClient.send(mailData);
      this.logger.log(response);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  private createMailData(
    data: EmailType,
    subject: string,
    content: string,
  ): MailDataRequired {
    return {
      to: data.to,
      from: this.from,
      subject,
      content: [
        {
          type: 'html',
          value: content,
        },
      ],
    };
  }
}
