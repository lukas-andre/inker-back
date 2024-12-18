import { AgendaEventProvider } from '../../../../../agenda/infrastructure/providers/agendaEvent.provider';
import { QuotationProvider } from '../../../../../agenda/infrastructure/providers/quotation.provider';
import { ArtistProvider } from '../../../../../artists/infrastructure/database/artist.provider';
import { CustomerProvider } from '../../../../../customers/infrastructure/providers/customer.provider';
import { ArtistLocationProvider } from '../../../../../locations/infrastructure/database/artistLocation.provider';
import { EmailNotificationService } from '../../../../../notifications/services/email/email.notification';
import { AccountVerificationCodeType, MailIdSchema } from '../../../../../notifications/services/email/schemas/email';
import { PushNotificationService } from '../../../../../notifications/services/push/pushNotification.service';
import { SendVerificationCodeJobType } from '../../../domain/schemas/codes';
import { NotificationJob } from '../notification.job';



export class VerificationCodeSentJob implements NotificationJob {
  constructor(
    private readonly emailNotificationService: EmailNotificationService,
    private readonly _1: AgendaEventProvider,
    private readonly _2: ArtistProvider,
    private readonly _3: CustomerProvider,
    private readonly _4: ArtistLocationProvider,
    private readonly _5: QuotationProvider,
    private readonly _6: PushNotificationService,
  ) {}

  async handle(job: SendVerificationCodeJobType): Promise<void> {
    const verificationCodeEmailData: AccountVerificationCodeType = {
      to: job.metadata.email,
      mailId: MailIdSchema.enum.ACCOUNT_VERIFICATION_CODE,
      verificationCode: job.metadata.code,
      expirationTime: job.metadata.expirationTime,
    };


    await this.emailNotificationService.sendEmail(verificationCodeEmailData);

  }
}
