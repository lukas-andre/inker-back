import { AgendaEventRepository } from '../../../../../agenda/infrastructure/repositories/agendaEvent.repository';
import { QuotationRepository } from '../../../../../agenda/infrastructure/repositories/quotation.provider';
import { ArtistRepository } from '../../../../../artists/infrastructure/repositories/artist.repository';
import { CustomerRepository } from '../../../../../customers/infrastructure/providers/customer.repository';
import { ArtistLocationRepository } from '../../../../../locations/infrastructure/database/artistLocation.repository';
import { EmailNotificationService } from '../../../../../notifications/services/email/email.notification';
import { RsvpDeclinedType } from '../../../../../notifications/services/email/schemas/email';
import { NotificationStorageService } from '../../../../../notifications/services/notification.storage';
import { PushNotificationService } from '../../../../../notifications/services/push/pushNotification.service';
import { RsvpDeclinedJobType } from '../../../domain/schemas/agenda';
import { NotificationJob, getGoogleMapsLink } from '../notification.job';

export class RsvpDeclinedJob implements NotificationJob {
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

  async handle(job: RsvpDeclinedJobType): Promise<void> {
    const { artistId, customerId, eventId } = job.metadata;
    const [agendaEvent, artist, customer, location] = await Promise.all([
      this.agendaEventProvider.findById(eventId),
      this.artistProvider.findById(artistId),
      this.customerProvider.findById(customerId),
      this.locationProvider.findOne({ where: { artistId } }),
    ]);

    if (!agendaEvent || !artist || !customer || !location) {
      console.error(`Missing data for RSVP declined notification: 
        Event: ${!!agendaEvent}, Artist: ${!!artist}, Customer: ${!!customer}, Location: ${!!location}`);
      return;
    }

    // Build notification title and message
    const title = `Appointment Invitation Declined`;
    const message = `${customer.firstName} has declined the invitation for "${
      agendaEvent.title
    }" on ${new Date(agendaEvent.startDate).toLocaleDateString()}`;

    // Store notification for artist
    await this.notificationStorageService.storeNotification(
      artistId,
      title,
      message,
      'RSVP_DECLINED',
      {
        eventId,
        customerId,
        customerName: customer.firstName,
      },
    );

    // Email notification
    const rsvpDeclinedEmailData: RsvpDeclinedType = {
      to: artist.contact.email,
      artistName: artist.username,
      customerName: customer.firstName,
      eventLocation: location.formattedAddress,
      googleMapsLink: getGoogleMapsLink(location.lat, location.lng),
      eventDate: agendaEvent.startDate,
      eventName: agendaEvent.title,
      mailId: 'RSVP_DECLINED',
    };
    await this.emailNotificationService.sendEmail(rsvpDeclinedEmailData);

    // Push notification to artist
    try {
      await this.pushNotificationService.sendToUser(
        artistId,
        {
          title,
          body: message,
        },
        {
          eventId,
          customerId,
          type: 'RSVP_DECLINED',
        },
      );
    } catch (error) {
      console.error('Failed to send push notification to artist', error);
      // Continue execution even if push notification fails
    }
  }
}
