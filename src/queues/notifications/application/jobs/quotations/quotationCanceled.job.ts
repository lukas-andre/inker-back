import { AgendaEventProvider } from '../../../../../agenda/infrastructure/providers/agendaEvent.provider';
import { QuotationProvider } from '../../../../../agenda/infrastructure/providers/quotation.provider';
import { ArtistProvider } from '../../../../../artists/infrastructure/database/artist.provider';
import { CustomerProvider } from '../../../../../customers/infrastructure/providers/customer.provider';
import { ArtistLocationProvider } from '../../../../../locations/infrastructure/database/artistLocation.provider';
import { EmailNotificationService } from '../../../../../notifications/services/email/email.notification';
import { PushNotificationService } from '../../../../../notifications/services/push/pushNotification.service';
import { QuotationCanceledJobType } from '../../../domain/schemas/quotation';
import { NotificationJob } from '../notification.job';

const QUOTATION_CANCELED_NOTIFICATIONS = {
  title: 'Cotización cancelada',
  body: 'Se ha cancelado una cotización',
} as const;

export class QuotationCanceledJob implements NotificationJob {
  constructor(
    private readonly emailNotificationService: EmailNotificationService,
    private readonly _1: AgendaEventProvider,
    private readonly artistProvider: ArtistProvider,
    private readonly customerProvider: CustomerProvider,
    private readonly _2: ArtistLocationProvider,
    private readonly quotationProvider: QuotationProvider,
    private readonly pushNotificationService: PushNotificationService,
  ) {}

  async handle(job: QuotationCanceledJobType): Promise<void> {
    const { artistId, customerId, quotationId } = job.metadata;

    const [quotation, artist, customer] = await Promise.all([
      this.quotationProvider.findById(quotationId),
      this.artistProvider.findById(artistId),
      this.customerProvider.findById(customerId),
    ]);

    if (!quotation || !artist || !customer) {
      throw new Error('Required data not found');
    }

    // const quotationCanceledEmailData: QuotationCanceledType = {
    //   to: artist.contact.email,
    //   artistName: artist.username,
    //   customerName: customer.firstName,
    //   mailId: 'QUOTATION_CANCELED',
    // };

    const notificationMetadata = {
      type: job.jobId,
      quotationId: quotationId.toString(),
      artistName: artist.username,
      customerName: customer.firstName,
    };

    await Promise.all([
      this.pushNotificationService.sendToUser(
        artist.userId,
        QUOTATION_CANCELED_NOTIFICATIONS,
        notificationMetadata,
      ),
      // this.emailNotificationService.sendEmail(quotationCanceledEmailData),
    ]);
  }
}
