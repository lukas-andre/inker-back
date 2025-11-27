import { Injectable } from '@nestjs/common';

import { BaseUseCase } from '../../global/domain/usecases/base.usecase';
import { EmailNotificationService } from '../../notifications/services/email/email.notification';
import { ContactMessageEmailType } from '../../notifications/services/email/schemas/email';
import { ContactDto } from '../domain/dtos/contact.dto';
import { IContactService } from '../domain/interfaces/contactService.interface';

@Injectable()
export class ProcessContactMessageUseCase
  extends BaseUseCase
  implements IContactService
{
  constructor(
    private readonly emailNotificationService: EmailNotificationService,
  ) {
    super(ProcessContactMessageUseCase.name);
  }

  async processContactMessage(data: ContactDto): Promise<void> {
    this.logger.log(`Processing contact message from ${data.email}`);

    try {
      const emailData: ContactMessageEmailType = {
        mailId: 'CONTACT_MESSAGE',
        to: 'lucas@inker.studio',
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
        userType: data.userType,
        messageType: data.messageType,
      };

      await this.emailNotificationService.sendEmail(emailData);

      this.logger.log(
        `Contact message email sent successfully from ${data.email}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send contact message email from ${data.email}`,
        error,
      );
      throw error;
    }
  }
}