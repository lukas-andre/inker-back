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
import { OfferAcceptedJobType } from '../../../domain/schemas/quotationOffer.schema';
import { NotificationJob } from '../notification.job';

export class OfferAcceptedJob implements NotificationJob {
  private readonly logger = new Logger(OfferAcceptedJob.name);

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

  async handle(job: OfferAcceptedJobType): Promise<void> {
    const { offerId, quotationId, acceptedArtistId } = job.metadata;
    this.logger.log(
      `Handling OFFER_ACCEPTED job for offer ${offerId} to artist ${acceptedArtistId}`,
    );

    try {
      // 1. Get Artist details (needed for userId)
      const artist = await this.artistProvider.findById(acceptedArtistId);
      if (!artist) {
        this.logger.warn(`Artist ${acceptedArtistId} not found.`);
        return;
      }

      // 2. Construct Notification Payload
      const payload = {
        notification: {
          title: 'Offer Accepted! ✅',
          body: 'Congratulations! Your offer for a quotation has been accepted by the customer.',
        },
        data: {
          type: 'OFFER_ACCEPTED',
          quotationId: quotationId,
          offerId: offerId,
          // Add any other relevant data for frontend navigation
        },
      };

      // 3. Send Push Notification via PushNotificationService using artist.userId
      await this.pushNotificationService.sendToUser(
        artist.userId,
        payload.notification,
        payload.data,
      );
      this.logger.log(
        `Sent OFFER_ACCEPTED push notification to artist ${acceptedArtistId} (user: ${artist.userId})`,
      );

      // 4. Send Email (Optional)
      // if (artist.contactEmail) { ... }
    } catch (error) {
      this.logger.error(
        `Error processing OFFER_ACCEPTED job for offer ${offerId}: ${
          (error as Error).message
        }`,
        (error as Error).stack,
      );
    }
  }
}
