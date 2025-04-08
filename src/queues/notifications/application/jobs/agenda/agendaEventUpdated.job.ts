import { Injectable } from '@nestjs/common';

import { AgendaEventRepository } from '../../../../../agenda/infrastructure/repositories/agendaEvent.repository';
import { QuotationRepository } from '../../../../../agenda/infrastructure/repositories/quotation.provider';
import { ArtistRepository } from '../../../../../artists/infrastructure/repositories/artist.repository';
import { CustomerRepository } from '../../../../../customers/infrastructure/providers/customer.repository';
import { ArtistLocationRepository } from '../../../../../locations/infrastructure/database/artistLocation.repository';
import { EmailNotificationService } from '../../../../../notifications/services/email/email.notification';
import { AgendaEventUpdatedType } from '../../../../../notifications/services/email/schemas/email';
import { AgendaEventUpdatedJobType } from '../../../domain/schemas/agenda';
import { getGoogleMapsLink } from '../notification.job';
import { PushNotificationService } from '../../../../../notifications/services/push/pushNotification.service';
import { NotificationStorageService } from '../../../../../notifications/services/notification.storage';

@Injectable()
export class AgendaEventUpdatedJob {
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

  async handle(job: AgendaEventUpdatedJobType): Promise<void> {
    const { artistId, customerId, eventId } = job.metadata;

    const [event, history, artist, customer, location] = await Promise.all([
      this.agendaEventProvider.findById(eventId),
      this.agendaEventProvider.findMostRecentHistoryRecord(eventId),
      this.artistProvider.findById(artistId),
      this.customerProvider.findById(customerId),
      this.locationProvider.findOne({ where: { artistId } }),
    ]);

    if (!event) {
      console.error(`Event not found for ID: ${eventId}`);
      return;
    }

    // TODO: This just suport date updates, we need to add support for location updates
    const agendaEventUpdatedEmailData: AgendaEventUpdatedType = {
      to: customer.contactEmail,
      artistName: artist.username,
      customerName: customer.firstName,
      eventLocation: location.formattedAddress,
      googleMapsLink: getGoogleMapsLink(location.lat, location.lng),
      eventDate: event.startDate,
      eventOldDate: history ? history.startDate : undefined,
      eventName: event.title,
      mailId: 'EVENT_UPDATED',
    };

    await this.emailNotificationService.sendEmail(agendaEventUpdatedEmailData);
  }
}
