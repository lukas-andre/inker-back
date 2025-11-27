import { AgendaEventRepository } from '../../../../../agenda/infrastructure/repositories/agendaEvent.repository';
import { QuotationRepository } from '../../../../../agenda/infrastructure/repositories/quotation.provider';
import { ArtistRepository } from '../../../../../artists/infrastructure/repositories/artist.repository';
import { CustomerRepository } from '../../../../../customers/infrastructure/providers/customer.repository';
import { ArtistLocationRepository } from '../../../../../locations/infrastructure/database/artistLocation.repository';
import { EmailNotificationService } from '../../../../../notifications/services/email/email.notification';
import { QuotationAcceptedType } from '../../../../../notifications/services/email/schemas/email';
import { NotificationStorageService } from '../../../../../notifications/services/notification.storage';
import { PushNotificationService } from '../../../../../notifications/services/push/pushNotification.service';
import { QuotationAcceptedJobType } from '../../../domain/schemas/quotation';
import { NotificationJob } from '../notification.job';

const QUOTATION_ACCEPTED_NOTIFICATIONS = {
  title: 'Cotización aceptada',
  body: 'Se ha aceptado la cotización',
} as const;

export class QuotationAcceptedJob implements NotificationJob {
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

  async handle(job: QuotationAcceptedJobType): Promise<void> {
    try {
      const { artistId, customerId, quotationId } = job.metadata;
      const [quotation, artist, customer] = await Promise.all([
        this.quotationProvider.findById(quotationId),
        this.artistProvider.findByIdWithContact(artistId),
        this.customerProvider.findById(customerId),
      ]);

      if (!quotation || !artist || !customer) {
        console.error(`Missing data for quotation accepted notification: 
          Quotation: ${!!quotation}, Artist: ${!!artist}, Customer: ${!!customer}`);
        return;
      }

      // Build notification title and message
      const title = 'Quotation Accepted';
      const message = `${customer.firstName} has accepted your quotation.`;

      // Store notification for artist
      await this.notificationStorageService.storeNotification(
        artist.userId,
        title,
        message,
        'QUOTATION_ACCEPTED',
        {
          quotationId: quotationId.toString(),
          customerId,
          customerName: customer.firstName,
          cost: quotation.estimatedCost?.toString(),
          date: quotation.appointmentDate,
        },
      );

      const quotationAcceptedEmailData: QuotationAcceptedType = {
        to: artist.contact.email,
        artistName: artist.username,
        customerName: customer.firstName,
        estimatedCost: quotation.estimatedCost?.toString() || 'N/A',
        appointmentDate: quotation.appointmentDate,
        appointmentDuration: quotation.appointmentDuration,
        mailId: 'QUOTATION_ACCEPTED',
      };

      const notificationMetadata = {
        type: 'QUOTATION_ACCEPTED',
        quotationId: quotationId.toString(),
        artistName: artist.username,
        customerName: customer.firstName,
      };

      await Promise.all([
        this.pushNotificationService.sendToUser(
          artist.userId,
          {
            title: title,
            body: message,
          },
          notificationMetadata,
        ),
        this.emailNotificationService.sendEmail(quotationAcceptedEmailData),
      ]);
    } catch (error) {
      console.error(
        'Failed to process quotation accepted notification:',
        error,
      );
    }
  }
}
