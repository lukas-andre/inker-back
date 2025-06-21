import { Injectable, Logger } from '@nestjs/common';

import { AgendaEventRepository } from '../../../../../agenda/infrastructure/repositories/agendaEvent.repository';
import { QuotationRepository } from '../../../../../agenda/infrastructure/repositories/quotation.provider';
import { ArtistRepository } from '../../../../../artists/infrastructure/repositories/artist.repository';
import { CustomerRepository } from '../../../../../customers/infrastructure/providers/customer.repository';
import { ArtistLocationRepository } from '../../../../../locations/infrastructure/database/artistLocation.repository';
import { EmailNotificationService } from '../../../../../notifications/services/email/email.notification';
import { AppointmentReminderEmailType } from '../../../../../notifications/services/email/schemas/email';
import { NotificationStorageService } from '../../../../../notifications/services/notification.storage';
import { PushNotificationService } from '../../../../../notifications/services/push/pushNotification.service';
import {
  APPOINTMENT_REMINDER,
  AppointmentReminderJobType,
} from '../../../domain/schemas/agenda';
import { NotificationJob, getGoogleMapsLink } from '../notification.job';

@Injectable()
export class AppointmentReminderJob extends NotificationJob {
  private readonly logger = new Logger(AppointmentReminderJob.name);

  constructor(
    emailNotificationService: EmailNotificationService,
    agendaEventProvider: AgendaEventRepository,
    artistProvider: ArtistRepository,
    customerProvider: CustomerRepository,
    locationProvider: ArtistLocationRepository,
    quotationProvider: QuotationRepository,
    pushNotificationService: PushNotificationService,
    notificationStorageService: NotificationStorageService,
  ) {
    super(
      emailNotificationService,
      agendaEventProvider,
      artistProvider,
      customerProvider,
      locationProvider,
      quotationProvider,
      pushNotificationService,
      notificationStorageService,
    );
  }

  async handle(job: AppointmentReminderJobType): Promise<void> {
    const {
      artistId,
      customerId,
      eventId,
      reminderType,
      appointmentDate,
      eventTitle,
    } = job.metadata;
    this.logger.log(
      `Handling ${APPOINTMENT_REMINDER} for event ${eventId}, reminder type: ${reminderType}`,
    );

    try {
      const [agendaEvent, artist, customer, location] = await Promise.all([
        this.agendaEventProvider.findById(eventId),
        this.artistProvider.findById(artistId),
        this.customerProvider.findById(customerId),
        this.locationProvider.findOne({ where: { artistId } }),
      ]);

      if (!agendaEvent || !artist || !customer || !location) {
        this.logger.error(`Missing data for appointment reminder: 
          Event: ${!!agendaEvent}, Artist: ${!!artist}, Customer: ${!!customer}, Location: ${!!location}`);
        return;
      }

      // Calculate hours until appointment
      const eventDate = new Date(appointmentDate);
      const now = new Date();
      const hoursUntilAppointment = Math.ceil(
        (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60),
      );

      // Build notification content based on reminder type
      let title: string;
      let message: string;

      switch (reminderType) {
        case 'APPOINTMENT_24H_BEFORE':
          title = '🗓️ Recordatorio: Cita mañana';
          message = `¡Hola ${customer.firstName}! Tu cita "${eventTitle}" con ${artist.username} es mañana. ¡No la olvides!`;
          break;
        case 'APPOINTMENT_2H_BEFORE':
          title = '🚨 ¡Tu cita es en 2 horas!';
          message = `¡Hola ${customer.firstName}! Tu cita "${eventTitle}" con ${artist.username} es en 2 horas. Dirección: ${location.formattedAddress}`;
          break;
        case 'APPOINTMENT_30MIN_BEFORE':
          title = '⏰ ¡Tu cita es muy pronto!';
          message = `¡Hola ${customer.firstName}! Tu cita "${eventTitle}" con ${artist.username} es en 30 minutos. ¡Es hora de ir!`;
          break;
        default:
          title = '📅 Recordatorio de Cita';
          message = `¡Hola ${customer.firstName}! Recordatorio de tu cita "${eventTitle}" con ${artist.username}.`;
      }

      // Store notification for customer
      await this.notificationStorageService.storeNotification(
        customer.userId,
        title,
        message,
        APPOINTMENT_REMINDER,
        {
          eventId,
          artistId,
          artistName: artist.username,
          reminderType,
          appointmentDate,
          hoursUntilAppointment: hoursUntilAppointment.toString(),
        },
      );

      // Email notification
      const appointmentReminderEmailData: AppointmentReminderEmailType = {
        to: customer.contactEmail,
        mailId: 'APPOINTMENT_REMINDER',
        customerName: customer.firstName,
        artistName: artist.username,
        eventName: eventTitle,
        eventDate: eventDate,
        eventLocation: location.formattedAddress,
        googleMapsLink: getGoogleMapsLink(location.lat, location.lng),
        reminderType,
        hoursUntilAppointment,
      };

      await this.emailNotificationService.sendEmail(
        appointmentReminderEmailData,
      );

      // Push notification to customer
      await this.pushNotificationService.sendToUser(
        customer.userId,
        {
          title,
          body: message,
        },
        {
          type: APPOINTMENT_REMINDER,
          eventId,
          artistId,
          reminderType,
        },
      );

      this.logger.log(
        `Successfully sent ${reminderType} reminder for event ${eventId} to customer ${customerId}`,
      );
    } catch (error) {
      const e = error as Error;
      this.logger.error(
        `Error handling ${APPOINTMENT_REMINDER} for event ${eventId}: ${e.message}`,
        e.stack,
      );
    }
  }
}
