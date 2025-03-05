import { AgendaEventProvider } from '../../../../../agenda/infrastructure/providers/agendaEvent.provider';
import { QuotationProvider } from '../../../../../agenda/infrastructure/providers/quotation.provider';
import { ArtistProvider } from '../../../../../artists/infrastructure/database/artist.provider';
import { CustomerProvider } from '../../../../../customers/infrastructure/providers/customer.provider';
import { ArtistLocationProvider } from '../../../../../locations/infrastructure/database/artistLocation.provider';
import { EmailNotificationService } from '../../../../../notifications/services/email/email.notification';
import { AgendaEventCreatedType } from '../../../../../notifications/services/email/schemas/email';
import { NotificationStorageService } from '../../../../../notifications/services/notification.storage';
import { PushNotificationService } from '../../../../../notifications/services/push/pushNotification.service';
import { AgendaEventcreatedJobType } from '../../../domain/schemas/agenda';
import { NotificationJob, getGoogleMapsLink } from '../notification.job';

export class AgendaEventCreatedJob implements NotificationJob {
  constructor(
    readonly emailNotificationService: EmailNotificationService,
    readonly agendaEventProvider: AgendaEventProvider,
    readonly artistProvider: ArtistProvider,
    readonly customerProvider: CustomerProvider,
    readonly locationProvider: ArtistLocationProvider,
    readonly quotationProvider: QuotationProvider,
    readonly pushNotificationService: PushNotificationService,
    readonly notificationStorageService: NotificationStorageService,
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
      eventDate: agendaEvent.startDate,
      eventName: agendaEvent.title,
      mailId: 'EVENT_CREATED',
    };
    await this.emailNotificationService.sendEmail(agendaEventCanceledEmailData);

    return;
  }
}
