import { Injectable } from '@nestjs/common';

import { BaseUseCase } from '../../global/domain/usecases/base.usecase';
import { EmailNotificationService } from '../../notifications/services/email/email.notification';
import { BetaSignupEmailType } from '../../notifications/services/email/schemas/email';
import { BetaSignupDto } from '../domain/dtos/betaSignup.dto';
import { IBetaSignupService } from '../domain/interfaces/betaSignupService.interface';

@Injectable()
export class ProcessBetaSignupUseCase
  extends BaseUseCase
  implements IBetaSignupService
{
  constructor(
    private readonly emailNotificationService: EmailNotificationService,
  ) {
    super(ProcessBetaSignupUseCase.name);
  }

  async processBetaSignup(data: BetaSignupDto): Promise<void> {
    this.logger.log(`Processing beta signup for ${data.email}`);

    try {
      const emailData: BetaSignupEmailType = {
        mailId: 'BETA_SIGNUP',
        to: 'lucas@inker.studio',
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
        userType: data.userType,
      };

      await this.emailNotificationService.sendEmail(emailData);

      this.logger.log(`Beta signup email sent successfully for ${data.email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send beta signup email for ${data.email}`,
        error,
      );
      throw error;
    }
  }
}