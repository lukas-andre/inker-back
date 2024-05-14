import { Injectable } from '@nestjs/common';

import { AgendaEventProvider } from '../../../../agenda/infrastructure/providers/agendaEvent.provider';
import { ArtistProvider } from '../../../../artists/infrastructure/database/artist.provider';
import { CustomerProvider } from '../../../../customers/infrastructure/providers/customer.provider';
import { ArtistLocationProvider } from '../../../../locations/infrastructure/database/artistLocation.provider';
import { EmailNotificationService } from '../../../../notifications/services/email/email.notification';
import { AgendaEventUpdatedType } from '../../../../notifications/services/email/schemas/email';
import { AgendaEventUpdatedJobType } from '../../domain/schemas/agenda';

import { getGoogleMapsLink } from './agendaEvent.job';

@Injectable()
export class AgendaEventUpdatedJob {
  constructor(
    private readonly emailNotificationService: EmailNotificationService,
    private readonly agendaEventProvider: AgendaEventProvider,
    private readonly artistProvider: ArtistProvider,
    private readonly customerProvider: CustomerProvider,
    private readonly locationProvider: ArtistLocationProvider,
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
      eventDate: event.start,
      eventOldDate: history ? history.start : undefined,
      eventName: event.title,
      mailId: 'EVENT_UPDATED',
    };

    await this.emailNotificationService.sendEmail(agendaEventUpdatedEmailData);
  }
}
