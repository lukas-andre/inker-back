import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { MailDataRequired, default as SendGrid } from '@sendgrid/mail';

import { sendGridConfig } from '../../config/sendgrid.config';
import { BaseComponent } from '../../global/domain/components/base.component';

@Injectable()
export class SendGridClient extends BaseComponent {
  constructor(
    @Inject(sendGridConfig.KEY)
    private sendGridConf: ConfigType<typeof sendGridConfig>,
  ) {
    super(SendGridClient.name);
    SendGrid.setApiKey(this.sendGridConf.apiKey);
  }

  async send(mail: MailDataRequired): Promise<void> {
    console.log(`Sending email to ${mail.to} with template ${mail.templateId}`);

    try {
      const response = await SendGrid.send(mail);
      this.logger.log(`Email successfully dispatched to ${mail.to as string}`);
      this.logger.debug(response);
    } catch (error) {
      this.logger.error('Error while sending email', error);
      throw error;
    }
  }
}
