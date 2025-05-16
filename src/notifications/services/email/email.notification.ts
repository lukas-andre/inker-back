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

  async sendPenaltyAppliedEmail(
    to: string,
    payload: {
      userName: string;
      penaltyAmount: number;
      currency: string;
      reason: string;
      cancellationReason?: string;
      eventId?: string;
    },
    locale: string = 'en',
  ): Promise<void> {
    // TODO: Use TemplateService for i18n and standardized templates
    const subject = locale === 'es' ? 'Penalización Aplicada' : 'Penalty Applied';
    const html = `
      <h1>Penalty Applied</h1>
      <p>Hello ${payload.userName},</p>
      <p>A penalty of ${payload.penaltyAmount} ${payload.currency} has been applied to your account.</p>
      <p>Reason: ${payload.reason}</p>
      ${payload.cancellationReason ? `<p>Cancellation Reason: ${payload.cancellationReason}</p>` : ''}
      ${payload.eventId ? `<p>Related Event ID: ${payload.eventId}</p>` : ''}
      <p>If you have any questions, please contact support.</p>
    `;

    const mailData: MailDataRequired = {
      to,
      from: this.from,
      subject,
      html,
    };

    this.logger.log(`Sending penalty applied email to ${to} with subject: ${subject}`);
    await this.sendGridClient.send(mailData);
  }
}
