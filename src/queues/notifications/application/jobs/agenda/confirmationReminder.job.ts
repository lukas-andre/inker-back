import { Injectable, Logger } from '@nestjs/common';
import { AgendaEventRepository } from '../../../../../agenda/infrastructure/repositories/agendaEvent.repository';
import { QuotationRepository } from '../../../../../agenda/infrastructure/repositories/quotation.provider';
import { ArtistRepository } from '../../../../../artists/infrastructure/repositories/artist.repository';
import { CustomerRepository } from '../../../../../customers/infrastructure/providers/customer.repository';
import { ArtistLocationRepository } from '../../../../../locations/infrastructure/database/artistLocation.repository';
import { EmailNotificationService } from '../../../../../notifications/services/email/email.notification';
import { ConfirmationReminderEmailType } from '../../../../../notifications/services/email/schemas/email';
import { NotificationStorageService } from '../../../../../notifications/services/notification.storage';
import { PushNotificationService } from '../../../../../notifications/services/push/pushNotification.service';
import { ConfirmationReminderJobType, CONFIRMATION_REMINDER } from '../../../domain/schemas/agenda';
import { NotificationJob } from '../notification.job';

@Injectable()
export class ConfirmationReminderJob extends NotificationJob {
  private readonly logger = new Logger(ConfirmationReminderJob.name);

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

  async handle(job: ConfirmationReminderJobType): Promise<void> {
    const { artistId, customerId, eventId, hoursRemaining } = job.metadata;
    this.logger.log(`Handling ${CONFIRMATION_REMINDER} for event ${eventId}, hours remaining: ${hoursRemaining}`);

    try {
      const [agendaEvent, artist, customer] = await Promise.all([
        this.agendaEventProvider.findById(eventId),
        this.artistProvider.findById(artistId),
        this.customerProvider.findById(customerId),
      ]);

      if (!agendaEvent || !artist || !customer) {
        this.logger.error(`Missing data for confirmation reminder: 
          Event: ${!!agendaEvent}, Artist: ${!!artist}, Customer: ${!!customer}`);
        return;
      }

      // Build notification content based on hours remaining
      let title: string;
      let message: string;
      let urgency: string;

      if (hoursRemaining <= 12) {
        title = '🚨 ¡Confirma tu cita URGENTE!';
        message = `¡Hola ${customer.firstName}! ${artist.username} está esperando tu confirmación. Tu cita será cancelada automáticamente en ${hoursRemaining} horas si no confirmas.`;
        urgency = 'critical';
      } else if (hoursRemaining <= 24) {
        title = '⏰ Confirma tu cita pronto';
        message = `¡Hola ${customer.firstName}! ${artist.username} necesita que confirmes tu cita "${agendaEvent.title}". Tienes ${hoursRemaining} horas para confirmar.`;
        urgency = 'urgent';
      } else {
        title = '📅 Confirma tu cita';
        message = `¡Hola ${customer.firstName}! ${artist.username} está esperando que confirmes tu cita "${agendaEvent.title}".`;
        urgency = 'normal';
      }

      // Store notification for customer
      await this.notificationStorageService.storeNotification(
        customer.userId,
        title,
        message,
        CONFIRMATION_REMINDER,
        {
          eventId,
          artistId,
          artistName: artist.username,
          hoursRemaining: hoursRemaining.toString(),
          urgency,
        },
      );

      // Build confirmation URL (this would typically be a deep link to the app)
      const confirmationUrl = `${process.env.FRONTEND_URL}/events/${eventId}/confirm`;

      // Email notification
      const confirmationReminderEmailData: ConfirmationReminderEmailType = {
        to: customer.contactEmail,
        mailId: 'CONFIRMATION_REMINDER',
        customerName: customer.firstName,
        artistName: artist.username,
        eventName: agendaEvent.title,
        eventDate: new Date(agendaEvent.startDate),
        hoursRemaining,
        confirmationUrl,
      };

      await this.emailNotificationService.sendEmail(confirmationReminderEmailData);

      // Push notification to customer
      await this.pushNotificationService.sendToUser(
        customer.userId,
        {
          title,
          body: message,
        },
        {
          type: CONFIRMATION_REMINDER,
          eventId,
          artistId,
          hoursRemaining: hoursRemaining.toString(),
          confirmationUrl,
          urgency,
        },
      );

      this.logger.log(`Successfully sent confirmation reminder for event ${eventId} to customer ${customerId}, ${hoursRemaining}h remaining`);

    } catch (error) {
      const e = error as Error;
      this.logger.error(`Error handling ${CONFIRMATION_REMINDER} for event ${eventId}: ${e.message}`, e.stack);
    }
  }
} 