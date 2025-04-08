import { AgendaEventRepository } from '../../../../../agenda/infrastructure/repositories/agendaEvent.repository';
import { QuotationRepository } from '../../../../../agenda/infrastructure/repositories/quotation.provider';
import { ArtistRepository } from '../../../../../artists/infrastructure/repositories/artist.repository';
import { CustomerRepository } from '../../../../../customers/infrastructure/providers/customer.repository';
import { ArtistLocationRepository } from '../../../../../locations/infrastructure/database/artistLocation.repository';
import { EmailNotificationService } from '../../../../../notifications/services/email/email.notification';
import { AgendaEventCanceledType } from '../../../../../notifications/services/email/schemas/email';
import { AgendaEventCanceledJobType } from '../../../domain/schemas/agenda';
import { NotificationJob, getGoogleMapsLink } from '../notification.job';
import { PushNotificationService } from '../../../../../notifications/services/push/pushNotification.service';
import { NotificationStorageService } from '../../../../../notifications/services/notification.storage';
export class AgendaEventCanceledJob implements NotificationJob {
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
      eventDate: agendaEvent.startDate,
      eventName: agendaEvent.title,
      cancelationReason: agendaEvent.cancelationReason,
      mailId: 'EVENT_CANCELED',
    };
    await this.emailNotificationService.sendEmail(agendaEventCanceledEmailData);
  }
}
