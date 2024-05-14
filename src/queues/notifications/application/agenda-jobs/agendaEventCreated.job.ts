import { AgendaEventProvider } from '../../../../agenda/infrastructure/providers/agendaEvent.provider';
import { ArtistProvider } from '../../../../artists/infrastructure/database/artist.provider';
import { CustomerProvider } from '../../../../customers/infrastructure/providers/customer.provider';
import { ArtistLocationProvider } from '../../../../locations/infrastructure/database/artistLocation.provider';
import { EmailNotificationService } from '../../../../notifications/services/email/email.notification';
import { AgendaEventCreatedType } from '../../../../notifications/services/email/schemas/email';
import { AgendaEventcreatedJobType } from '../../domain/schemas/agenda';

import { AgendaEventJob, getGoogleMapsLink } from './agendaEvent.job';

export class AgendaEventCreatedJob implements AgendaEventJob {
  constructor(
    private readonly emailNotificationService: EmailNotificationService,
    private readonly agendaEventProvider: AgendaEventProvider,
    private readonly artistProvider: ArtistProvider,
    private readonly customerProvider: CustomerProvider,
    private readonly locationProvider: ArtistLocationProvider,
  ) {}
  async handle(job: AgendaEventcreatedJobType): Promise<void> {
    const { artistId, customerId, eventId } = job.metadata;
    const [agendaEvent, artist, customer, location] = await Promise.all([
      this.agendaEventProvider.findById(eventId),
      this.artistProvider.findById(artistId),
      this.customerProvider.findById(customerId),
      this.locationProvider.findOne({ where: { artistId } }),
    ]);

    const agendaEventCanceledEmailData: AgendaEventCreatedType = {
      to: customer.contactEmail,
      artistName: artist.username,
      customerName: customer.firstName,
      eventLocation: location.formattedAddress,
      googleMapsLink: getGoogleMapsLink(location.lat, location.lng),
      eventDate: agendaEvent.start,
      eventName: agendaEvent.title,
      mailId: 'EVENT_CREATED',
    };
    await this.emailNotificationService.sendEmail(agendaEventCanceledEmailData);

    return;
  }
}
