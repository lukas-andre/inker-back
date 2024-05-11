import { Injectable } from '@nestjs/common';
import { MailDataRequired } from '@sendgrid/mail';

import { BaseComponent } from '../../../global/domain/components/base.component';
import { SendGridClient } from '../../clients/sendGrid.client';

import { BaseEmailDto } from './email.dto';
import { TemplateService } from './template.service';

@Injectable()
export class EmailNotificationService extends BaseComponent {
  private readonly from = 'contacto@inker.studio';

  constructor(
    private readonly sendGridClient: SendGridClient,
    private readonly templateService: TemplateService,
  ) {
    super(EmailNotificationService.name);
  }

  async sendEmail(dto: BaseEmailDto): Promise<void> {
    const content = await this.templateService.getContent(dto);
    const mailData: MailDataRequired = {
      to: dto.to,
      from: this.from,
      subject: 'Notification',
      content: [
        {
          type: 'html',
          value: content,
        },
      ],
    };

    try {
      const response = await this.sendGridClient.send(mailData);
      console.log(`Email successfully dispatched to ${mailData.to}`);
    } catch (error) {
      console.error('Error while sending email', error);
      throw error;
    }
  }
}
