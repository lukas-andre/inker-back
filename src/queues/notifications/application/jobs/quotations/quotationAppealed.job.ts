import { AgendaEventProvider } from '../../../../../agenda/infrastructure/providers/agendaEvent.provider';
import { QuotationProvider } from '../../../../../agenda/infrastructure/providers/quotation.provider';
import { ArtistProvider } from '../../../../../artists/infrastructure/database/artist.provider';
import { CustomerProvider } from '../../../../../customers/infrastructure/providers/customer.provider';
import { ArtistLocationProvider } from '../../../../../locations/infrastructure/database/artistLocation.provider';
import { EmailNotificationService } from '../../../../../notifications/services/email/email.notification';
import { QuotationAppealedType } from '../../../../../notifications/services/email/schemas/email';
import { NotificationStorageService } from '../../../../../notifications/services/notification.storage';
import { PushNotificationService } from '../../../../../notifications/services/push/pushNotification.service';
import { QuotationAppealedJobType } from '../../../domain/schemas/quotation';
import { NotificationJob } from '../notification.job';

const QUOTATION_APPEALED_NOTIFICATIONS = {
  title: 'Cotización apelada',
  body: 'Se ha apelado una cotización',
} as const;

export class QuotationAppealedJob implements NotificationJob {
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

  async handle(job: QuotationAppealedJobType): Promise<void> {
    const { artistId, customerId, quotationId } = job.metadata;
    const [quotation, artist, customer] = await Promise.all([
      this.quotationProvider.findById(quotationId),
      this.artistProvider.findByIdWithContact(artistId),
      this.customerProvider.findById(customerId),
    ]);

    const quotationAppealedEmailData: QuotationAppealedType = {
      to: artist.contact.email,
      artistName: artist.username,
      customerName: customer.firstName,
      appealReason: quotation.appealedReason,
      mailId: 'QUOTATION_APPEALED',
    };

    const notificationMetadata = {
      type: job.jobId,
      quotationId: quotationId.toString(),
      artistName: artist.username,
      customerName: customer.firstName,
    };

    await Promise.all([
      this.pushNotificationService.sendToUser(
        artist.userId,
        QUOTATION_APPEALED_NOTIFICATIONS,
        notificationMetadata,
      ),
      this.emailNotificationService.sendEmail(quotationAppealedEmailData),
    ]);
  }
}
