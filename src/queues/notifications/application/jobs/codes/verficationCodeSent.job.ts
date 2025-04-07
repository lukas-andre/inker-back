import { AgendaEventProvider } from '../../../../../agenda/infrastructure/providers/agendaEvent.provider';
import { QuotationProvider } from '../../../../../agenda/infrastructure/providers/quotation.provider';
import { ArtistProvider } from '../../../../../artists/infrastructure/database/artist.provider';
import { CustomerProvider } from '../../../../../customers/infrastructure/providers/customer.provider';
import { ArtistLocationProvider } from '../../../../../locations/infrastructure/database/artistLocation.provider';
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
    readonly agendaEventProvider: AgendaEventProvider,
    readonly artistProvider: ArtistProvider,
    readonly customerProvider: CustomerProvider,
    readonly locationProvider: ArtistLocationProvider,
    readonly quotationProvider: QuotationProvider,
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
