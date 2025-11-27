import { Injectable, Logger } from '@nestjs/common';

import { AgendaEventRepository } from '../../../../../agenda/infrastructure/repositories/agendaEvent.repository';
import { QuotationRepository } from '../../../../../agenda/infrastructure/repositories/quotation.provider';
import { ArtistRepository } from '../../../../../artists/infrastructure/repositories/artist.repository';
import { CustomerRepository } from '../../../../../customers/infrastructure/providers/customer.repository';
import { ArtistLocationRepository } from '../../../../../locations/infrastructure/database/artistLocation.repository';
import { EmailNotificationService } from '../../../../../notifications/services/email/email.notification';
import { NotificationStorageService } from '../../../../../notifications/services/notification.storage';
import { PushNotificationService } from '../../../../../notifications/services/push/pushNotification.service';
import {
  PHOTO_UPLOAD_REMINDER,
  PhotoUploadReminderJobType,
} from '../../../domain/schemas/agenda';
import { NotificationJob } from '../notification.job';

@Injectable()
export class PhotoUploadReminderJob extends NotificationJob {
  private readonly logger = new Logger(PhotoUploadReminderJob.name);

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

  async handle(job: PhotoUploadReminderJobType): Promise<void> {
    const { artistId, customerId, eventId, reminderType } = job.metadata;
    this.logger.log(
      `Handling ${PHOTO_UPLOAD_REMINDER} for event ${eventId}, reminder type: ${reminderType}`,
    );

    try {
      const [agendaEvent, artist, customer] = await Promise.all([
        this.agendaEventProvider.findById(eventId),
        this.artistProvider.findById(artistId),
        this.customerProvider.findById(customerId),
      ]);

      if (!agendaEvent || !artist || !customer) {
        this.logger.error(`Missing data for photo upload reminder: 
          Event: ${!!agendaEvent}, Artist: ${!!artist}, Customer: ${!!customer}`);
        return;
      }

      // Build notification content based on reminder type
      let title: string;
      let artistMessage: string;
      let customerMessage: string;

      switch (reminderType) {
        case 'PHOTO_REQUEST_IMMEDIATELY':
          title = '📸 ¡Sube las fotos del tatuaje!';
          artistMessage = `¡Sesión completada! Sube las fotos del tatuaje de ${customer.firstName} para finalizar la cita "${agendaEvent.title}".`;
          customerMessage = `¡Tu sesión con ${artist.username} ha terminado! El artista está preparando las fotos de tu nuevo tatuaje.`;
          break;
        case 'PHOTO_REQUEST_24H_REMINDER':
          title = '📸 Recordatorio: Fotos pendientes';
          artistMessage = `Recordatorio: Aún no has subido las fotos del tatuaje de ${customer.firstName} (cita: "${agendaEvent.title}"). El cliente está esperando.`;
          customerMessage = `Estamos esperando que ${artist.username} suba las fotos de tu tatuaje. Le enviaremos un recordatorio.`;
          break;
        default:
          title = '📸 Fotos del Tatuaje';
          artistMessage = `Por favor, sube las fotos del tatuaje para la cita "${agendaEvent.title}" con ${customer.firstName}.`;
          customerMessage = `${artist.username} está preparando las fotos de tu tatuaje.`;
      }

      // Store notification for artist
      await this.notificationStorageService.storeNotification(
        artist.userId,
        title,
        artistMessage,
        PHOTO_UPLOAD_REMINDER,
        {
          eventId,
          customerId,
          customerName: customer.firstName,
          reminderType,
        },
      );

      // Store notification for customer (so they know what's happening)
      await this.notificationStorageService.storeNotification(
        customer.userId,
        '🎨 Tu Tatuaje Está Listo',
        customerMessage,
        PHOTO_UPLOAD_REMINDER,
        {
          eventId,
          artistId,
          artistName: artist.username,
          reminderType,
        },
      );

      // Build photo upload URL (this would typically be a deep link to the app)
      const uploadUrl = `${process.env.FRONTEND_URL}/events/${eventId}/photos/upload`;

      // Push notification to artist (main target)
      await this.pushNotificationService.sendToUser(
        artist.userId,
        {
          title,
          body: artistMessage,
        },
        {
          type: PHOTO_UPLOAD_REMINDER,
          eventId,
          customerId,
          reminderType,
          uploadUrl,
        },
      );

      // Push notification to customer (informational)
      await this.pushNotificationService.sendToUser(
        customer.userId,
        {
          title: '🎨 Tu Tatuaje Está Listo',
          body: customerMessage,
        },
        {
          type: PHOTO_UPLOAD_REMINDER,
          eventId,
          artistId,
          reminderType: 'CUSTOMER_INFO',
        },
      );

      this.logger.log(
        `Successfully sent ${reminderType} photo upload reminder for event ${eventId}`,
      );
    } catch (error) {
      const e = error as Error;
      this.logger.error(
        `Error handling ${PHOTO_UPLOAD_REMINDER} for event ${eventId}: ${e.message}`,
        e.stack,
      );
    }
  }
}
