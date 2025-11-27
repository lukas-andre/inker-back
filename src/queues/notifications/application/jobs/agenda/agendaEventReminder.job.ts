import { AgendaEventRepository } from '../../../../../agenda/infrastructure/repositories/agendaEvent.repository';
import { QuotationRepository } from '../../../../../agenda/infrastructure/repositories/quotation.provider';
import { ArtistRepository } from '../../../../../artists/infrastructure/repositories/artist.repository';
import { CustomerRepository } from '../../../../../customers/infrastructure/providers/customer.repository';
import { ArtistLocationRepository } from '../../../../../locations/infrastructure/database/artistLocation.repository';
import { EmailNotificationService } from '../../../../../notifications/services/email/email.notification';
import { AgendaEventReminderType } from '../../../../../notifications/services/email/schemas/email';
import { NotificationStorageService } from '../../../../../notifications/services/notification.storage';
import { PushNotificationService } from '../../../../../notifications/services/push/pushNotification.service';
import { AgendaEventReminderJobType } from '../../../domain/schemas/agenda';
import { NotificationJob, getGoogleMapsLink } from '../notification.job';

export class AgendaEventReminderJob implements NotificationJob {
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

  async handle(job: AgendaEventReminderJobType): Promise<void> {
    const {
      artistId,
      customerId,
      eventId,
      reminderType = '24-hours',
    } = job.metadata;
    const [agendaEvent, artist, customer, location] = await Promise.all([
      this.agendaEventProvider.findById(eventId),
      this.artistProvider.findById(artistId),
      this.customerProvider.findById(customerId),
      this.locationProvider.findOne({ where: { artistId } }),
    ]);

    if (!agendaEvent || !artist || !customer || !location) {
      console.error('Missing required data for reminder:', {
        event: !!agendaEvent,
        artist: !!artist,
        customer: !!customer,
        location: !!location,
      });
      return;
    }

    const timeDescription =
      reminderType === '3-hours' ? 'en unas horas' : 'mañana';

    const agendaEventReminderEmailData: AgendaEventReminderType = {
      to: customer.contactEmail,
      artistName: artist.username,
      customerName: customer.firstName,
      eventLocation: location.formattedAddress,
      googleMapsLink: getGoogleMapsLink(location.lat, location.lng),
      eventDate: agendaEvent.startDate,
      eventName: agendaEvent.title,
      timeDescription: timeDescription,
      mailId: 'EVENT_REMINDER',
    };

    await this.emailNotificationService.sendEmail(agendaEventReminderEmailData);

    const notificationContent = `¡Recordatorio! Tu cita "${agendaEvent.title}" con ${artist.username} está programada para ${timeDescription}.`;

    await this.notificationStorageService.storeNotification(
      customer.userId,
      'Recordatorio de Cita',
      notificationContent,
      'EVENT_REMINDER',
      {
        eventId: agendaEvent.id,
        artistId: artist.id,
        reminderType,
      },
    );

    try {
      await this.pushNotificationService.sendToUser(
        customer.userId,
        {
          title: 'Recordatorio de Cita',
          body: notificationContent,
        },
        {
          type: 'EVENT_REMINDER',
          eventId: agendaEvent.id.toString(),
          artistId: artist.id.toString(),
        },
      );
    } catch (error) {
      console.error('Failed to send push notification:', error);
    }
  }
}
