import { AgendaEventRepository } from '../../../../../agenda/infrastructure/repositories/agendaEvent.repository';
import { QuotationRepository } from '../../../../../agenda/infrastructure/repositories/quotation.provider';
import { ArtistRepository } from '../../../../../artists/infrastructure/repositories/artist.repository';
import { CustomerRepository } from '../../../../../customers/infrastructure/providers/customer.repository';
import { ArtistLocationRepository } from '../../../../../locations/infrastructure/database/artistLocation.repository';
import { EmailNotificationService } from '../../../../../notifications/services/email/email.notification';
import { QuotationRepliedType } from '../../../../../notifications/services/email/schemas/email';
import { NotificationStorageService } from '../../../../../notifications/services/notification.storage';
import { PushNotificationService } from '../../../../../notifications/services/push/pushNotification.service';
import { QuotationRepliedJobType } from '../../../domain/schemas/quotation';
import { NotificationJob } from '../notification.job';

const QUOTATION_REPLIED_NOTIFICATIONS = {
  title: 'Cotización respondida',
  body: 'Se ha respondido una cotización',
} as const;

export class QuotationRepliedJob extends NotificationJob {
  constructor(
    emailNotificationService: EmailNotificationService,
    agendaEventProvider: AgendaEventRepository,
    artistProvider: ArtistRepository,
    customerProvider: CustomerRepository,
    locationProvider: ArtistLocationRepository,
    quotationProvider: QuotationRepository,
    pushNotificationService: PushNotificationService,
    notificationStorageService: NotificationStorageService,
  ) {
    super(
      emailNotificationService,
      agendaEventProvider,
      artistProvider,
      customerProvider,
      locationProvider,
      quotationProvider,
      pushNotificationService,
      notificationStorageService
    );
  }

  async handle(job: QuotationRepliedJobType): Promise<void> {
    try {
      const { artistId, customerId, quotationId } = job.metadata;
      const [quotation, artist, customer] = await Promise.all([
        this.quotationProvider.findById(quotationId),
        this.artistProvider.findById(artistId),
        this.customerProvider.findById(customerId),
      ]);

      if (!quotation || !artist || !customer) {
        console.error(`Missing data for quotation replied notification: 
          Quotation: ${!!quotation}, Artist: ${!!artist}, Customer: ${!!customer}`);
        return;
      }

      // Build notification title and message
      const title = 'Quotation Replied';
      const message = `${artist.username} has replied to your quotation request.`;

      // Store notification for customer
      await this.notificationStorageService.storeNotification(
        customer.userId,
        title,
        message,
        'QUOTATION_REPLIED',
        {
          quotationId: quotationId.toString(),
          artistUserId: artist.userId,
          artistId: artist.id,
          artistName: artist.username,
          cost: quotation.estimatedCost?.toString(),
          date: quotation.appointmentDate,
        },
      );

      // Build email notification data
      const quotationRepliedEmailData: QuotationRepliedType = {
        to: customer.contactEmail,
        artistName: artist.username,
        customerName: customer.firstName,
        estimatedCost: quotation.estimatedCost?.toString() || "N/A",
        appointmentDate: quotation.appointmentDate,
        appointmentDuration: quotation.appointmentDuration,
        mailId: 'QUOTATION_REPLIED',
      };

      const notificationMetadata = {
        type: 'QUOTATION_REPLIED',
        quotationId: quotationId.toString(),
        artistName: artist.username,
        customerName: customer.firstName,
      };

      await Promise.all([
        this.pushNotificationService.sendToUser(
          customer.userId,
          {
            title: title,
            body: message,
          },
          notificationMetadata,
        ),
        this.emailNotificationService.sendEmail(quotationRepliedEmailData),
      ]);
    } catch (error) {
      console.error('Failed to process quotation replied notification:', error);
    }
  }
}
