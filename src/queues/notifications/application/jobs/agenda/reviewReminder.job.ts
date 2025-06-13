import { Injectable, Logger } from '@nestjs/common';
import { AgendaEventRepository } from '../../../../../agenda/infrastructure/repositories/agendaEvent.repository';
import { QuotationRepository } from '../../../../../agenda/infrastructure/repositories/quotation.provider';
import { ArtistRepository } from '../../../../../artists/infrastructure/repositories/artist.repository';
import { CustomerRepository } from '../../../../../customers/infrastructure/providers/customer.repository';
import { ArtistLocationRepository } from '../../../../../locations/infrastructure/database/artistLocation.repository';
import { EmailNotificationService } from '../../../../../notifications/services/email/email.notification';
import { ReviewReminderEmailType } from '../../../../../notifications/services/email/schemas/email';
import { NotificationStorageService } from '../../../../../notifications/services/notification.storage';
import { PushNotificationService } from '../../../../../notifications/services/push/pushNotification.service';
import { ReviewReminderJobType, REVIEW_REMINDER } from '../../../domain/schemas/agenda';
import { NotificationJob } from '../notification.job';

@Injectable()
export class ReviewReminderJob extends NotificationJob {
  private readonly logger = new Logger(ReviewReminderJob.name);

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

  async handle(job: ReviewReminderJobType): Promise<void> {
    const { artistId, customerId, eventId, reminderType } = job.metadata;
    this.logger.log(`Handling ${REVIEW_REMINDER} for event ${eventId}, reminder type: ${reminderType}`);

    try {
      const [agendaEvent, artist, customer] = await Promise.all([
        this.agendaEventProvider.findById(eventId),
        this.artistProvider.findById(artistId),
        this.customerProvider.findById(customerId),
      ]);

      if (!agendaEvent || !artist || !customer) {
        this.logger.error(`Missing data for review reminder: 
          Event: ${!!agendaEvent}, Artist: ${!!artist}, Customer: ${!!customer}`);
        return;
      }

      // Build notification content based on reminder type
      let title: string;
      let message: string;
      let priority: string;

      switch (reminderType) {
        case 'REVIEW_REQUEST_24H_AFTER':
          title = '⭐ ¡Cuéntanos tu experiencia!';
          message = `¡Hola ${customer.firstName}! ¿Cómo estuvo tu sesión con ${artist.username}? Tu opinión ayuda a otros clientes y al artista a mejorar.`;
          priority = 'normal';
          break;
        case 'REVIEW_REQUEST_48H_AFTER':
          title = '🌟 Segundo recordatorio: Tu reseña';
          message = `¡Hola ${customer.firstName}! No queremos ser insistentes, pero tu opinión sobre la sesión con ${artist.username} es muy valiosa para nuestra comunidad.`;
          priority = 'low';
          break;
        default:
          title = '⭐ Deja tu reseña';
          message = `¡Hola ${customer.firstName}! Por favor, considera dejar una reseña sobre tu experiencia con ${artist.username}.`;
          priority = 'normal';
      }

      // Store notification for customer
      await this.notificationStorageService.storeNotification(
        customer.userId,
        title,
        message,
        REVIEW_REMINDER,
        {
          eventId,
          artistId,
          artistName: artist.username,
          reminderType,
          priority,
        },
      );

      // Build review URL (this would typically be a deep link to the app)
      const reviewUrl = `${process.env.FRONTEND_URL}/events/${eventId}/review`;

      // Email notification
      const reviewReminderEmailData: ReviewReminderEmailType = {
        to: customer.contactEmail,
        mailId: 'REVIEW_REMINDER',
        customerName: customer.firstName,
        artistName: artist.username,
        eventName: agendaEvent.title,
        completedDate: new Date(agendaEvent.endDate || agendaEvent.startDate),
        reminderType,
        reviewUrl,
      };

      await this.emailNotificationService.sendEmail(reviewReminderEmailData);

      // Push notification to customer
      await this.pushNotificationService.sendToUser(
        customer.userId,
        {
          title,
          body: message,
        },
        {
          type: REVIEW_REMINDER,
          eventId,
          artistId,
          reminderType,
          reviewUrl,
        },
      );

      this.logger.log(`Successfully sent ${reminderType} review reminder for event ${eventId} to customer ${customerId}`);

    } catch (error) {
      const e = error as Error;
      this.logger.error(`Error handling ${REVIEW_REMINDER} for event ${eventId}: ${e.message}`, e.stack);
    }
  }
} 