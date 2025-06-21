import { Injectable } from '@nestjs/common';

import { AgendaEventRepository } from '../../../../../agenda/infrastructure/repositories/agendaEvent.repository';
import { QuotationRepository } from '../../../../../agenda/infrastructure/repositories/quotation.provider';
import { ArtistRepository } from '../../../../../artists/infrastructure/repositories/artist.repository';
import { CustomerRepository } from '../../../../../customers/infrastructure/providers/customer.repository';
import { ArtistLocationRepository } from '../../../../../locations/infrastructure/database/artistLocation.repository';
import { EmailNotificationService } from '../../../../../notifications/services/email/email.notification';
import { AgendaEventUpdatedType } from '../../../../../notifications/services/email/schemas/email';
import { NotificationStorageService } from '../../../../../notifications/services/notification.storage';
import { PushNotificationService } from '../../../../../notifications/services/push/pushNotification.service';
import { AgendaEventUpdatedJobType } from '../../../domain/schemas/agenda';
import { getGoogleMapsLink } from '../notification.job';

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

    const event = await this.agendaEventProvider.findById(eventId);

    if (!event) {
      console.error(`Event not found for ID: ${eventId}`);
      return;
    }

    // Artist, Customer, Location are fetched in parallel after event is confirmed to exist
    const [artist, customer, location] = await Promise.all([
      this.artistProvider.findById(artistId),
      this.customerProvider.findById(customerId),
      this.locationProvider.findOne({ where: { artistId } }),
    ]);

    if (!artist || !customer || !location) {
      console.error(
        `Missing artist, customer, or location for event ID: ${eventId}. Artist: ${!!artist}, Customer: ${!!customer}, Location: ${!!location}`,
      );
      return;
    }

    let eventOldDate: Date | undefined = undefined;
    // If statusLog exists and has at least two entries, the second to last one represents the state before the last update.
    // The last entry is the one made by UpdateEventUseCase itself, detailing the update.
    if (event.statusLog && event.statusLog.length >= 1) {
      // The UpdateEventUseCase adds a log for the update.
      // If we want the date *before* that update, we need to find a log entry
      // that represents a state where the date was set.
      // The notes of the most recent log entry *might* contain the old date.
      const lastLogEntry = event.statusLog[event.statusLog.length - 1];
      if (lastLogEntry.notes && lastLogEntry.notes.includes('startDate from')) {
        const match = lastLogEntry.notes.match(/startDate from "(.*?)"/);
        if (match && match[1]) {
          eventOldDate = new Date(match[1]);
        }
      }
      // Fallback: if not in notes, and there are multiple logs,
      // try to get it from the previous log's actual data. This is tricky because the previous log might not be a date change.
      // For now, relying on notes from UpdateEventUseCase is the most direct way given current implementation.
    }

    const agendaEventUpdatedEmailData: AgendaEventUpdatedType = {
      to: customer.contactEmail,
      artistName: artist.username,
      customerName: customer.firstName,
      eventLocation: location.formattedAddress,
      googleMapsLink: getGoogleMapsLink(location.lat, location.lng),
      eventDate: event.startDate, // This is the new/current date
      eventOldDate: eventOldDate, // This is what we tried to get from history
      eventName: event.title,
      mailId: 'EVENT_UPDATED',
    };

    await this.emailNotificationService.sendEmail(agendaEventUpdatedEmailData);
  }
}
