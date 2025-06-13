import { Injectable, Logger } from '@nestjs/common';
import { AgendaEventRepository } from '../../../../../agenda/infrastructure/repositories/agendaEvent.repository';
import { QuotationRepository } from '../../../../../agenda/infrastructure/repositories/quotation.provider';
import { ArtistRepository } from '../../../../../artists/infrastructure/repositories/artist.repository';
import { CustomerRepository } from '../../../../../customers/infrastructure/providers/customer.repository';
import { ArtistLocationRepository } from '../../../../../locations/infrastructure/database/artistLocation.repository';
import { EmailNotificationService } from '../../../../../notifications/services/email/email.notification';
import { ConsentReminderEmailType } from '../../../../../notifications/services/email/schemas/email';
import { NotificationStorageService } from '../../../../../notifications/services/notification.storage';
import { PushNotificationService } from '../../../../../notifications/services/push/pushNotification.service';
import { ConsentReminderJobType, CONSENT_REMINDER } from '../../../domain/schemas/agenda';
import { NotificationJob } from '../notification.job';

@Injectable()
export class ConsentReminderJob extends NotificationJob {
  private readonly logger = new Logger(ConsentReminderJob.name);

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

  async handle(job: ConsentReminderJobType): Promise<void> {
    const { artistId, customerId, eventId, reminderType, appointmentDate } = job.metadata;
    this.logger.log(`Handling ${CONSENT_REMINDER} for event ${eventId}, reminder type: ${reminderType}`);

    try {
      const [agendaEvent, artist, customer, location] = await Promise.all([
        this.agendaEventProvider.findById(eventId),
        this.artistProvider.findById(artistId),
        this.customerProvider.findById(customerId),
        this.locationProvider.findOne({ where: { artistId } }),
      ]);

      if (!agendaEvent || !artist || !customer || !location) {
        this.logger.error(`Missing data for consent reminder: 
          Event: ${!!agendaEvent}, Artist: ${!!artist}, Customer: ${!!customer}, Location: ${!!location}`);
        return;
      }

      // Calculate hours until appointment
      const eventDate = new Date(appointmentDate);
      const now = new Date();
      const hoursUntilAppointment = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60));

      // Build notification content based on reminder type
      let title: string;
      let message: string;
      let urgency: string;

      switch (reminderType) {
        case 'CONSENT_12H_BEFORE':
          title = '📋 Consentimiento Requerido';
          message = `¡Hola ${customer.firstName}! Tu cita con ${artist.username} es mañana. Por favor, firma el formulario de consentimiento antes de tu cita.`;
          urgency = 'normal';
          break;
        case 'CONSENT_2H_BEFORE':
          title = '🚨 ¡Consentimiento Urgente!';
          message = `¡Hola ${customer.firstName}! Tu cita con ${artist.username} es en 2 horas. DEBES firmar el consentimiento AHORA o tu cita será cancelada.`;
          urgency = 'urgent';
          break;
        default:
          title = '📋 Firma tu Consentimiento';
          message = `¡Hola ${customer.firstName}! Necesitas firmar el formulario de consentimiento para tu cita con ${artist.username}.`;
          urgency = 'normal';
      }

      // Store notification for customer
      await this.notificationStorageService.storeNotification(
        customer.userId,
        title,
        message,
        CONSENT_REMINDER,
        {
          eventId,
          artistId,
          artistName: artist.username,
          reminderType,
          appointmentDate,
          hoursUntilAppointment: hoursUntilAppointment.toString(),
          urgency,
        },
      );

      // Build consent URL (this would typically be a deep link to the app)
      const consentUrl = `${process.env.FRONTEND_URL}/events/${eventId}/consent`;

      // Email notification
      const consentReminderEmailData: ConsentReminderEmailType = {
        to: customer.contactEmail,
        mailId: 'CONSENT_REMINDER',
        customerName: customer.firstName,
        artistName: artist.username,
        eventName: agendaEvent.title,
        eventDate: eventDate,
        eventLocation: location.formattedAddress,
        reminderType,
        hoursUntilAppointment,
        consentUrl,
      };

      await this.emailNotificationService.sendEmail(consentReminderEmailData);

      // Push notification to customer
      await this.pushNotificationService.sendToUser(
        customer.userId,
        {
          title,
          body: message,
        },
        {
          type: CONSENT_REMINDER,
          eventId,
          artistId,
          reminderType,
          consentUrl,
          urgency,
        },
      );

      this.logger.log(`Successfully sent ${reminderType} consent reminder for event ${eventId} to customer ${customerId}`);

    } catch (error) {
      const e = error as Error;
      this.logger.error(`Error handling ${CONSENT_REMINDER} for event ${eventId}: ${e.message}`, e.stack);
    }
  }
} 