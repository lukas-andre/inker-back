import { AgendaEventRepository } from '../../../../../agenda/infrastructure/repositories/agendaEvent.repository';
import { QuotationRepository } from '../../../../../agenda/infrastructure/repositories/quotation.provider';
import { ArtistRepository } from '../../../../../artists/infrastructure/repositories/artist.repository';
import { CustomerRepository } from '../../../../../customers/infrastructure/providers/customer.repository';
import { ArtistLocationRepository } from '../../../../../locations/infrastructure/database/artistLocation.repository';
import { EmailNotificationService } from '../../../../../notifications/services/email/email.notification';
import { NotificationStorageService } from '../../../../../notifications/services/notification.storage';
import { PushNotificationService } from '../../../../../notifications/services/push/pushNotification.service';
import { QuotationCanceledJobType } from '../../../domain/schemas/quotation';
import { NotificationJob } from '../notification.job';

const QUOTATION_CANCELED_NOTIFICATIONS = {
  title: 'Cotización cancelada',
  body: 'Se ha cancelado una cotización',
} as const;

export class QuotationCanceledJob implements NotificationJob {
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

  async handle(job: QuotationCanceledJobType): Promise<void> {
    try {
      const { artistId, customerId, quotationId } = job.metadata;

      const [quotation, artist, customer] = await Promise.all([
        this.quotationProvider.findById(quotationId),
        this.artistProvider.findById(artistId),
        this.customerProvider.findById(customerId),
      ]);

      if (!quotation || !artist || !customer) {
        console.error(`Missing data for quotation canceled notification: 
          Quotation: ${!!quotation}, Artist: ${!!artist}, Customer: ${!!customer}`);
        return;
      }

      // Since only customers can cancel, we can hardcode the notification flow
      const title = 'Quotation Canceled by Customer';
      const message = `${customer.firstName} has canceled the quotation request.`;

      // Store notification for artist
      await this.notificationStorageService.storeNotification(
        artist.userId,
        title,
        message,
        'QUOTATION_CANCELED',
        {
          quotationId: quotationId.toString(),
          customerId,
          customerName: customer.firstName,
        },
      );

      // Build notification metadata
      const notificationMetadata = {
        type: 'QUOTATION_CANCELED',
        quotationId: quotationId.toString(),
        artistName: artist.username,
        customerName: customer.firstName,
      };

      // Send push notification to artist
      await this.pushNotificationService.sendToUser(
        artist.userId,
        {
          title,
          body: message,
        },
        notificationMetadata,
      );

      // Removed system cancellation logic since that should be handled in a separate job
      // if needed, and artist cancellations are handled in rejection jobs
    } catch (error) {
      console.error(
        'Failed to process quotation canceled notification:',
        error,
      );
    }
  }
}
