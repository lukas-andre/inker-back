import { BatchResponse } from 'firebase-admin/lib/messaging/messaging-api';
import { AgendaEventProvider } from '../../../../../agenda/infrastructure/providers/agendaEvent.provider';
import { QuotationProvider } from '../../../../../agenda/infrastructure/providers/quotation.provider';
import { ArtistProvider } from '../../../../../artists/infrastructure/database/artist.provider';
import { CustomerProvider } from '../../../../../customers/infrastructure/providers/customer.provider';
import { ArtistLocationProvider } from '../../../../../locations/infrastructure/database/artistLocation.provider';
import { EmailNotificationService } from '../../../../../notifications/services/email/email.notification';
import { QuotationRejectedType } from '../../../../../notifications/services/email/schemas/email';
import { PushNotificationService } from '../../../../../notifications/services/push/pushNotification.service';
import { QuotationRejectedJobType } from '../../../domain/schemas/quotation';
import { NotificationJob } from '../notification.job';

const QUOTATION_REJECTED_NOTIFICATIONS = {
  title: 'Cotización rechazada',
  body: 'Se ha rechazado una cotización'
} as const;

export class QuotationRejectedJob implements NotificationJob {
  constructor(
    private readonly emailNotificationService: EmailNotificationService,
    private readonly _1: AgendaEventProvider,
    private readonly artistProvider: ArtistProvider,
    private readonly customerProvider: CustomerProvider,
    private readonly _2: ArtistLocationProvider,
    private readonly quotationProvider: QuotationProvider,
    private readonly pushNotificationService: PushNotificationService,
  ) {}

  async handle(job: QuotationRejectedJobType): Promise<void> {
    const { artistId, customerId, quotationId, by } = job.metadata;
    const [quotation, artist, customer] = await Promise.all([
      this.quotationProvider.findById(quotationId),
      this.artistProvider.findByIdWithContact(artistId),
      this.customerProvider.findById(customerId),
    ]);

    const quotationRejectedEmailData: QuotationRejectedType = {
      to: artist.contact.email,
      artistName: artist.username,
      customerName: customer.firstName,
      rejectionReason: quotation.rejectReasonDetails,
      mailId: 'QUOTATION_REJECTED',
    };

    const notificationMetadata = {
      type: job.jobId,
      quotationId: quotationId.toString(),
    };

    let promise: Promise<BatchResponse>;
    if (by === 'customer') {
      promise = this.pushNotificationService.sendToUser(artist.userId, QUOTATION_REJECTED_NOTIFICATIONS, {
        ...notificationMetadata,
        customerName: customer.firstName,
      });
    } else {
      promise = this.pushNotificationService.sendToUser(customer.userId, QUOTATION_REJECTED_NOTIFICATIONS, {
        ...notificationMetadata,
        artistName: artist.username,
      });
    }

    await Promise.all([
      promise,
      this.emailNotificationService.sendEmail(quotationRejectedEmailData),
    ]); 
  }
}
