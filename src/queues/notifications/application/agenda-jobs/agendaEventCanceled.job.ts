import { AgendaEventProvider } from '../../../../agenda/infrastructure/providers/agendaEvent.provider';
import { ArtistProvider } from '../../../../artists/infrastructure/database/artist.provider';
import { CustomerProvider } from '../../../../customers/infrastructure/providers/customer.provider';
import { ArtistLocationProvider } from '../../../../locations/infrastructure/database/artistLocation.provider';
import { EmailNotificationService } from '../../../../notifications/services/email/email.notification';
import { AgendaEventCanceledType } from '../../../../notifications/services/email/schemas/email';
import { AgendaEventCanceledJobType } from '../../domain/schemas/agenda';

import { NotificationJob, getGoogleMapsLink } from './agendaEvent.job';

export class AgendaEventCanceledJob implements NotificationJob {
  constructor(
    private readonly emailNotificationService: EmailNotificationService,
    private readonly agendaEventProvider: AgendaEventProvider,
    private readonly artistProvider: ArtistProvider,
    private readonly customerProvider: CustomerProvider,
    private readonly locationProvider: ArtistLocationProvider,
  ) {}
  async handle(job: AgendaEventCanceledJobType): Promise<void> {
    const { artistId, customerId, eventId } = job.metadata;
    const [agendaEvent, artist, customer, location] = await Promise.all([
      this.agendaEventProvider.findById(eventId),
      this.artistProvider.findById(artistId),
      this.customerProvider.findById(customerId),
      this.locationProvider.findOne({ where: { artistId } }),
    ]);

    const agendaEventCanceledEmailData: AgendaEventCanceledType = {
      to: customer.contactEmail,
      artistName: artist.username,
      customerName: customer.firstName,
      eventLocation: location.formattedAddress,
      googleMapsLink: getGoogleMapsLink(location.lat, location.lng),
      eventDate: agendaEvent.start,
      eventName: agendaEvent.title,
      cancelationReason: agendaEvent.cancelationReason,
      mailId: 'EVENT_CANCELED',
    };
    await this.emailNotificationService.sendEmail(agendaEventCanceledEmailData);
  }
}
