import { AgendaEventRepository } from '../../../../../agenda/infrastructure/repositories/agendaEvent.repository';
import { QuotationRepository } from '../../../../../agenda/infrastructure/repositories/quotation.provider';
import { ArtistRepository } from '../../../../../artists/infrastructure/repositories/artist.repository';
import { CustomerRepository } from '../../../../../customers/infrastructure/providers/customer.repository';
import { ArtistLocationRepository } from '../../../../../locations/infrastructure/database/artistLocation.repository';
import { EmailNotificationService } from '../../../../../notifications/services/email/email.notification';
import { AgendaEventCreatedType } from '../../../../../notifications/services/email/schemas/email';
import { NotificationStorageService } from '../../../../../notifications/services/notification.storage';
import { PushNotificationService } from '../../../../../notifications/services/push/pushNotification.service';
import { AgendaEventcreatedJobType } from '../../../domain/schemas/agenda';
import { NotificationJob, getGoogleMapsLink } from '../notification.job';

export class AgendaEventCreatedJob implements NotificationJob {
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
  async handle(job: AgendaEventcreatedJobType): Promise<void> {
    const { artistId, customerId, eventId } = job.metadata;
    const [agendaEvent, artist, customer, location] = await Promise.all([
      this.agendaEventProvider.findById(eventId),
      this.artistProvider.findById(artistId),
      this.customerProvider.findById(customerId),
      this.locationProvider.findOne({ where: { artistId } }),
    ]);

    if (!agendaEvent || !artist || !customer || !location) {
      console.error(`Missing data for event created notification: 
        Event: ${!!agendaEvent}, Artist: ${!!artist}, Customer: ${!!customer}, Location: ${!!location}`);
      return;
    }

    // Build notification title and messages
    const customerTitle = `New Appointment Scheduled`;
    const customerMessage = `Your appointment "${agendaEvent.title}" with ${
      artist.username
    } has been scheduled for ${new Date(
      agendaEvent.startDate,
    ).toLocaleDateString()}`;

    const artistTitle = `New Appointment Created`;
    const artistMessage = `New appointment "${agendaEvent.title}" with ${
      customer.firstName
    } has been scheduled for ${new Date(
      agendaEvent.startDate,
    ).toLocaleDateString()}`;

    // Store notification for customer
    await this.notificationStorageService.storeNotification(
      customer.userId,
      customerTitle,
      customerMessage,
      'EVENT_CREATED',
      {
        eventId,
        artistId,
        artistName: artist.username,
      },
    );

    // Store notification for artist
    await this.notificationStorageService.storeNotification(
      artist.userId,
      artistTitle,
      artistMessage,
      'EVENT_CREATED',
      {
        eventId,
        customerId,
        customerName: customer.firstName,
      },
    );

    // Email notification
    const agendaEventCreatedEmailData: AgendaEventCreatedType = {
      to: customer.contactEmail,
      artistName: artist.username,
      customerName: customer.firstName,
      eventLocation: location.formattedAddress,
      googleMapsLink: getGoogleMapsLink(location.lat, location.lng),
      eventDate: agendaEvent.startDate,
      eventName: agendaEvent.title,
      mailId: 'EVENT_CREATED',
    };
    await this.emailNotificationService.sendEmail(agendaEventCreatedEmailData);

    // Push notification to customer
    try {
      await this.pushNotificationService.sendToUser(
        customer.userId,
        {
          title: customerTitle,
          body: customerMessage,
        },
        {
          eventId,
          type: 'EVENT_CREATED',
        },
      );
    } catch (error) {
      console.error('Failed to send push notification to customer', error);
      // Continue execution even if push notification fails
    }

    // Push notification to artist
    try {
      await this.pushNotificationService.sendToUser(
        artist.userId,
        {
          title: artistTitle,
          body: artistMessage,
        },
        {
          eventId,
          type: 'EVENT_CREATED',
        },
      );
    } catch (error) {
      console.error('Failed to send push notification to artist', error);
      // Continue execution even if push notification fails
    }

    return;
  }
}
