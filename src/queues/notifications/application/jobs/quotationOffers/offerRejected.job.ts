// import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger, Injectable } from '@nestjs/common';

import { queues } from '../../../../queues';
import { OfferRejectedJobType } from '../../../domain/schemas/quotationOffer.schema';
import { PushNotificationService } from '../../../../../notifications/services/push/pushNotification.service';
import { ArtistRepository } from '../../../../../artists/infrastructure/repositories/artist.repository';
import { NotificationJob } from '../notification.job';
import { AgendaEventRepository } from '../../../../../agenda/infrastructure/repositories/agendaEvent.repository';
import { QuotationRepository } from '../../../../../agenda/infrastructure/repositories/quotation.provider';
import { CustomerRepository } from '../../../../../customers/infrastructure/providers/customer.repository';
import { ArtistLocationRepository } from '../../../../../locations/infrastructure/database/artistLocation.repository';
import { EmailNotificationService } from '../../../../../notifications/services/email/email.notification';
import { NotificationStorageService } from '../../../../../notifications/services/notification.storage';

export class OfferRejectedJob implements NotificationJob {
    private readonly logger = new Logger(OfferRejectedJob.name);

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

    async handle(job: OfferRejectedJobType): Promise<void> {
        const { offerId, quotationId, rejectedArtistId } = job.metadata;
        this.logger.log(`Handling OFFER_REJECTED job for offer ${offerId} to artist ${rejectedArtistId}`);

        try {
            // 1. Get Artist details (needed for userId)
            const artist = await this.artistProvider.findById(rejectedArtistId);
            if (!artist) {
                this.logger.warn(`Artist ${rejectedArtistId} not found.`);
                return;
            }

            // 2. Construct Notification Payload
            const payload = {
                notification: {
                    title: 'Offer Not Selected',
                    body: 'Unfortunately, your offer for a quotation was not selected by the customer this time.',
                },
                data: {
                    type: 'OFFER_REJECTED',
                    quotationId: quotationId,
                    offerId: offerId,
                    // Add any other relevant data for frontend navigation
                },
            };

            // 3. Send Push Notification via PushNotificationService using artist.userId
            await this.pushNotificationService.sendToUser(artist.userId, payload.notification, payload.data);
            this.logger.log(`Sent OFFER_REJECTED push notification to artist ${rejectedArtistId} (user: ${artist.userId})`);

            // 4. Send Email (Optional)
            // if (artist.contactEmail) { ... }

        } catch (error) {
            this.logger.error(
                `Error processing OFFER_REJECTED job for offer ${offerId}: ${(error as Error).message}`,
                (error as Error).stack,
            );
        }
    }
} 