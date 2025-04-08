import { BatchResponse } from 'firebase-admin/lib/messaging/messaging-api';
import { AgendaEventRepository } from '../../../../../agenda/infrastructure/repositories/agendaEvent.repository';
import { QuotationRepository } from '../../../../../agenda/infrastructure/repositories/quotation.provider';
import { ArtistRepository } from '../../../../../artists/infrastructure/repositories/artist.repository';
import { CustomerRepository } from '../../../../../customers/infrastructure/providers/customer.repository';
import { ArtistLocationRepository } from '../../../../../locations/infrastructure/database/artistLocation.repository';
import { EmailNotificationService } from '../../../../../notifications/services/email/email.notification';
import { QuotationRejectedType } from '../../../../../notifications/services/email/schemas/email';
import { PushNotificationService } from '../../../../../notifications/services/push/pushNotification.service';
import { QuotationRejectedJobType } from '../../../domain/schemas/quotation';
import { NotificationJob } from '../notification.job';
import { NotificationStorageService } from '../../../../../notifications/services/notification.storage';

const QUOTATION_REJECTED_NOTIFICATIONS = {
  title: 'Cotización rechazada',
  body: 'Se ha rechazado una cotización',
} as const;

export class QuotationRejectedJob implements NotificationJob {
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

  async handle(job: QuotationRejectedJobType): Promise<void> {
    try {
      const { artistId, customerId, quotationId, by } = job.metadata;
      const [quotation, artist, customer] = await Promise.all([
        this.quotationProvider.findById(quotationId),
        this.artistProvider.findByIdWithContact(artistId),
        this.customerProvider.findById(customerId),
      ]);

      if (!quotation || !artist || !customer) {
        console.error(`Missing data for quotation rejected notification: 
          Quotation: ${!!quotation}, Artist: ${!!artist}, Customer: ${!!customer}`);
        return;
      }

      // Build notification data based on who rejected
      let title, message;
      
      if (by === 'customer') {
        // Customer rejected artist's quotation
        title = 'Quotation Rejected by Customer';
        message = `${customer.firstName} has rejected your quotation. Reason: ${quotation.rejectReasonDetails || 'No reason provided'}`;
        
        // Store notification for artist
        await this.notificationStorageService.storeNotification(
          artist.userId,
          title,
          message,
          'QUOTATION_REJECTED',
          {
            quotationId: quotationId.toString(),
            customerId,
            customerName: customer.firstName,
            reason: quotation.rejectReasonDetails,
          },
        );
      } else {
        // Artist rejected customer's quotation
        title = 'Quotation Rejected by Artist';
        message = `${artist.username} has rejected your quotation. Reason: ${quotation.rejectReasonDetails || 'No reason provided'}`;
        
        // Store notification for customer
        await this.notificationStorageService.storeNotification(
          customer.userId,
          title,
          message,
          'QUOTATION_REJECTED',
          {
            quotationId: quotationId.toString(),
            artistId,
            artistName: artist.username,
            reason: quotation.rejectReasonDetails,
          },
        );
      }

      const quotationRejectedEmailData: QuotationRejectedType = {
        to: by === 'customer' ? artist.contact.email : customer.contactEmail,
        artistName: artist.username,
        customerName: customer.firstName,
        rejectionReason: quotation.rejectReasonDetails || 'No reason provided',
        mailId: 'QUOTATION_REJECTED',
      };

      const notificationMetadata = {
        type: 'QUOTATION_REJECTED',
        quotationId: quotationId.toString(),
      };

      let pushPromise: Promise<BatchResponse>;
      if (by === 'customer') {
        pushPromise = this.pushNotificationService.sendToUser(
          artist.userId,
          {
            title,
            body: message,
          },
          {
            ...notificationMetadata,
            customerName: customer.firstName,
          },
        );
      } else {
        pushPromise = this.pushNotificationService.sendToUser(
          customer.userId,
          {
            title,
            body: message,
          },
          {
            ...notificationMetadata,
            artistName: artist.username,
          },
        );
      }

      await Promise.all([
        pushPromise,
        this.emailNotificationService.sendEmail(quotationRejectedEmailData),
      ]);
    } catch (error) {
      console.error('Failed to process quotation rejected notification:', error);
    }
  }
}
