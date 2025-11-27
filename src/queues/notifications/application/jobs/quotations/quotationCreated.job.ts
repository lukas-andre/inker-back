import { AgendaEventRepository } from '../../../../../agenda/infrastructure/repositories/agendaEvent.repository';
import { QuotationRepository } from '../../../../../agenda/infrastructure/repositories/quotation.provider';
import { ArtistRepository } from '../../../../../artists/infrastructure/repositories/artist.repository';
import { CustomerRepository } from '../../../../../customers/infrastructure/providers/customer.repository';
import { ArtistLocationRepository } from '../../../../../locations/infrastructure/database/artistLocation.repository';
import { EmailNotificationService } from '../../../../../notifications/services/email/email.notification';
import { QuotationCreatedType } from '../../../../../notifications/services/email/schemas/email';
import { NotificationStorageService } from '../../../../../notifications/services/notification.storage';
import { PushNotificationService } from '../../../../../notifications/services/push/pushNotification.service';
import { QuotationCreatedJobType } from '../../../domain/schemas/quotation';
import { NotificationJob } from '../notification.job';

const QUOTATION_NOTIFICATIONS = {
  title: 'Nueva cotización',
  body: 'Se ha creado una nueva cotización',
} as const;

export class QuotationCreatedJob implements NotificationJob {
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

  async handle(job: QuotationCreatedJobType): Promise<void> {
    try {
      const { artistId, customerId, quotationId } = job.metadata;
      const [quotation, artist, customer] = await Promise.all([
        this.quotationProvider.findById(quotationId),
        this.artistProvider.findByIdWithContact(artistId),
        this.customerProvider.findById(customerId),
      ]);

      if (!quotation || !artist || !customer) {
        console.error(`Missing data for quotation created notification: 
          Quotation: ${!!quotation}, Artist: ${!!artist}, Customer: ${!!customer}`);
        return;
      }

      // Build notification titles and messages
      const artistTitle = 'New Quotation Request';
      const artistMessage = `${customer.firstName} has sent you a new quotation request.`;

      // Store notification for artist
      await this.notificationStorageService.storeNotification(
        artist.userId,
        artistTitle,
        artistMessage,
        'QUOTATION_CREATED',
        {
          quotationId: quotationId.toString(),
          customerId,
          customerName: customer.firstName,
        },
      );

      const notificationMetadata = {
        type: 'QUOTATION_CREATED',
        quotationId: quotationId.toString(),
        customerName: customer.firstName,
      };

      const quotationCreatedEmailData: QuotationCreatedType = {
        to: artist.contact.email,
        artistName: artist.username,
        customerName: customer.firstName,
        mailId: 'QUOTATION_CREATED',
        description: quotation.description || 'No description provided',
        // referenceImages: quotation.referenceImages.metadata.map(image => image.url) || [],
      };

      await Promise.all([
        this.pushNotificationService.sendToUser(
          artist.userId,
          {
            title: artistTitle,
            body: artistMessage,
          },
          notificationMetadata,
        ),
        this.emailNotificationService.sendEmail(quotationCreatedEmailData),
      ]);
    } catch (error) {
      console.error(
        'Failed to process quotation creation notifications:',
        error,
      );
      throw error;
    }
  }
}
