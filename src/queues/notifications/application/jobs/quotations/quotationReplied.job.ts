import { AgendaEventProvider } from '../../../../../agenda/infrastructure/providers/agendaEvent.provider';
import { QuotationProvider } from '../../../../../agenda/infrastructure/providers/quotation.provider';
import { ArtistProvider } from '../../../../../artists/infrastructure/database/artist.provider';
import { CustomerProvider } from '../../../../../customers/infrastructure/providers/customer.provider';
import { ArtistLocationProvider } from '../../../../../locations/infrastructure/database/artistLocation.provider';
import { EmailNotificationService } from '../../../../../notifications/services/email/email.notification';
import { QuotationRepliedType } from '../../../../../notifications/services/email/schemas/email';
import { PushNotificationService } from '../../../../../notifications/services/push/pushNotification.service';
import { QuotationRepliedJobType } from '../../../domain/schemas/quotation';
import { NotificationJob } from '../notification.job';

const QUOTATION_REPLIED_NOTIFICATIONS = {
  title: 'Cotización respondida',
  body: 'Se ha respondido una cotización',
} as const;

export class QuotationRepliedJob implements NotificationJob {
  constructor(
    private readonly emailNotificationService: EmailNotificationService,
    private readonly _1: AgendaEventProvider,
    private readonly artistProvider: ArtistProvider,
    private readonly customerProvider: CustomerProvider,
    private readonly _2: ArtistLocationProvider,
    private readonly quotationProvider: QuotationProvider,
    private readonly pushNotificationService: PushNotificationService,
  ) {}

  async handle(job: QuotationRepliedJobType): Promise<void> {
    const { artistId, customerId, quotationId } = job.metadata;
    const [quotation, artist, customer] = await Promise.all([
      this.quotationProvider.findById(quotationId),
      this.artistProvider.findById(artistId),
      this.customerProvider.findById(customerId),
    ]);

    // const quotationRepliedEmailData: QuotationRepliedType = {
    //   to: customer.contactEmail,
    //   artistName: artist.username,
    //   customerName: customer.firstName,
    //   estimatedCost: quotation.estimatedCost.toString(),
    //   appointmentDate: quotation.appointmentDate,
    //   appointmentDuration: quotation.appointmentDuration,
    //   mailId: 'QUOTATION_REPLIED',
    // };

    const notificationMetadata = {
      type: job.jobId,
      quotationId: quotationId.toString(),
      artistName: artist.username,
      customerName: customer.firstName,
    };

    await Promise.all([
      this.pushNotificationService.sendToUser(
        customer.userId,
        QUOTATION_REPLIED_NOTIFICATIONS,
        notificationMetadata,
      ),
      // this.emailNotificationService.sendEmail(quotationRepliedEmailData),
    ]);
  }
}
