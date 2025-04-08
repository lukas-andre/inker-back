import { AgendaEventRepository } from '../../../../../agenda/infrastructure/repositories/agendaEvent.repository';
import { QuotationRepository } from '../../../../../agenda/infrastructure/repositories/quotation.provider';
import { ArtistRepository } from '../../../../../artists/infrastructure/repositories/artist.repository';
import { CustomerRepository } from '../../../../../customers/infrastructure/providers/customer.repository';
import { ArtistLocationRepository } from '../../../../../locations/infrastructure/database/artistLocation.repository';
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
    readonly agendaEventProvider: AgendaEventRepository,
    readonly artistProvider: ArtistRepository,
    readonly customerProvider: CustomerRepository,
    readonly locationProvider: ArtistLocationRepository,
    readonly quotationProvider: QuotationRepository,
    readonly pushNotificationService: PushNotificationService,
    readonly notificationStorageService: NotificationStorageService,
  ) {}

  async handle(job: QuotationAppealedJobType): Promise<void> {
    try {
      const { artistId, customerId, quotationId } = job.metadata;
      const [quotation, artist, customer] = await Promise.all([
        this.quotationProvider.findById(quotationId),
        this.artistProvider.findByIdWithContact(artistId),
        this.customerProvider.findById(customerId),
      ]);

      if (!quotation || !artist || !customer) {
        console.error(`Missing data for quotation appealed notification: 
          Quotation: ${!!quotation}, Artist: ${!!artist}, Customer: ${!!customer}`);
        return;
      }

      // Build notification title and message
      const title = 'Quotation Appeal Received';
      const message = `${customer.firstName} has appealed your quotation decision. Reason: ${quotation.appealedReason || 'No reason provided'}`;

      // Store notification for artist
      await this.notificationStorageService.storeNotification(
        artist.userId,
        title,
        message,
        'QUOTATION_APPEALED',
        {
          quotationId: quotationId.toString(),
          customerId,
          customerName: customer.firstName,
          reason: quotation.appealedReason,
        },
      );

      const quotationAppealedEmailData: QuotationAppealedType = {
        to: artist.contact.email,
        artistName: artist.username,
        customerName: customer.firstName,
        appealReason: quotation.appealedReason || 'No reason provided',
        mailId: 'QUOTATION_APPEALED',
      };

      const notificationMetadata = {
        type: 'QUOTATION_APPEALED',
        quotationId: quotationId.toString(),
        artistName: artist.username,
        customerName: customer.firstName,
      };

      await Promise.all([
        this.pushNotificationService.sendToUser(
          artist.userId,
          {
            title,
            body: message,
          },
          notificationMetadata,
        ),
        this.emailNotificationService.sendEmail(quotationAppealedEmailData),
      ]);
    } catch (error) {
      console.error('Failed to process quotation appealed notification:', error);
    }
  }
}
