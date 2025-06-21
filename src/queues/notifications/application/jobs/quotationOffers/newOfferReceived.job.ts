// import { Process, Processor } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bull';

import { AgendaEventRepository } from '../../../../../agenda/infrastructure/repositories/agendaEvent.repository';
import { QuotationRepository } from '../../../../../agenda/infrastructure/repositories/quotation.provider';
import { ArtistRepository } from '../../../../../artists/infrastructure/repositories/artist.repository';
import { CustomerRepository } from '../../../../../customers/infrastructure/providers/customer.repository';
import { ArtistLocationRepository } from '../../../../../locations/infrastructure/database/artistLocation.repository';
import { EmailNotificationService } from '../../../../../notifications/services/email/email.notification';
import { NotificationStorageService } from '../../../../../notifications/services/notification.storage';
import { PushNotificationService } from '../../../../../notifications/services/push/pushNotification.service';
import { queues } from '../../../../queues';
import { NewOfferReceivedJobType } from '../../../domain/schemas/quotationOffer.schema';
import { NotificationJob } from '../notification.job';

export class NewOfferReceivedJob implements NotificationJob {
  private readonly logger = new Logger(NewOfferReceivedJob.name);

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

  async handle(job: NewOfferReceivedJobType): Promise<void> {
    const { offerId, quotationId, customerId, artistId } = job.metadata;
    this.logger.log(`Handling NEW_OFFER_RECEIVED job for offer ${offerId}`);

    try {
      // 1. Get Customer details (needed for userId)
      const customer = await this.customerProvider.findById(customerId);
      if (!customer) {
        this.logger.warn(`Customer ${customerId} not found.`);
        return; // Or handle error appropriately
      }

      // 2. Get Artist details (for notification message)
      const artist = await this.artistProvider.findById(artistId);
      const artistName = artist
        ? `${artist.firstName} ${artist.lastName}`
        : 'An artist';

      // 3. Construct Notification Payload
      const payload = {
        notification: {
          title: 'New Offer Received! 🎨',
          body: `${artistName} submitted an offer for your open quotation.`,
        },
        data: {
          type: 'NEW_OFFER_RECEIVED',
          quotationId: quotationId,
          offerId: offerId,
        },
      };

      // 4. Send Push Notification via PushNotificationService using customer.userId
      await this.pushNotificationService.sendToUser(
        customer.userId,
        payload.notification,
        payload.data,
      );
      this.logger.log(
        `Sent NEW_OFFER_RECEIVED push notification to customer ${customerId} (user: ${customer.userId})`,
      );

      // 5. Send Email (Optional)
      // if (customer.contactEmail) { ... }
    } catch (error) {
      this.logger.error(
        `Error processing NEW_OFFER_RECEIVED job for offer ${offerId}: ${
          (error as Error).message
        }`,
        (error as Error).stack,
      );
    }
  }
}
