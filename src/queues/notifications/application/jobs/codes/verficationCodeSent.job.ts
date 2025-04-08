import { AgendaEventRepository } from '../../../../../agenda/infrastructure/repositories/agendaEvent.repository';
import { QuotationRepository } from '../../../../../agenda/infrastructure/repositories/quotation.provider';
import { ArtistRepository } from '../../../../../artists/infrastructure/repositories/artist.repository';
import { CustomerRepository } from '../../../../../customers/infrastructure/providers/customer.repository';
import { ArtistLocationRepository } from '../../../../../locations/infrastructure/database/artistLocation.repository';
import { EmailNotificationService } from '../../../../../notifications/services/email/email.notification';
import {
  AccountVerificationCodeType,
  MailIdSchema,
} from '../../../../../notifications/services/email/schemas/email';
import { NotificationStorageService } from '../../../../../notifications/services/notification.storage';
import { PushNotificationService } from '../../../../../notifications/services/push/pushNotification.service';
import { SendVerificationCodeJobType } from '../../../domain/schemas/codes';
import { NotificationJob } from '../notification.job';

export class VerificationCodeSentJob implements NotificationJob {
  constructor(
    readonly emailNotificationService: EmailNotificationService,
    readonly agendaEventProvider: AgendaEventRepository,
    readonly artistProvider: ArtistRepository,
    readonly customerProvider: CustomerRepository,
    readonly locationProvider: ArtistLocationRepository,
    readonly quotationProvider: QuotationRepository,
    readonly pushNotificationService: PushNotificationService,
    readonly notificationStorageService: NotificationStorageService,
  ) {}

  async handle(job: SendVerificationCodeJobType): Promise<void> {
    const verificationCodeEmailData: AccountVerificationCodeType = {
      to: job.metadata.email,
      mailId: MailIdSchema.enum.ACCOUNT_VERIFICATION_CODE,
      verificationCode: job.metadata.code,
      expirationTime: job.metadata.expirationTime,
    };

    if (job.notificationTypeId === 'EMAIL') {
      await this.emailNotificationService.sendEmail(verificationCodeEmailData);
    }
  }
}
