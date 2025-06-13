import { Injectable, Logger } from '@nestjs/common';
import { AgendaEventRepository } from '../../../../../agenda/infrastructure/repositories/agendaEvent.repository';
import { QuotationRepository } from '../../../../../agenda/infrastructure/repositories/quotation.provider';
import { ArtistRepository } from '../../../../../artists/infrastructure/repositories/artist.repository';
import { CustomerRepository } from '../../../../../customers/infrastructure/providers/customer.repository';
import { ArtistLocationRepository } from '../../../../../locations/infrastructure/database/artistLocation.repository';
import { EmailNotificationService } from '../../../../../notifications/services/email/email.notification';
import { EventAutoCanceledEmailType } from '../../../../../notifications/services/email/schemas/email';
import { NotificationStorageService } from '../../../../../notifications/services/notification.storage';
import { PushNotificationService } from '../../../../../notifications/services/push/pushNotification.service';
import { EventAutoCanceledJobType, EVENT_AUTO_CANCELED } from '../../../domain/schemas/agenda';
import { NotificationJob } from '../notification.job';

@Injectable()
export class EventAutoCanceledJob extends NotificationJob {
  private readonly logger = new Logger(EventAutoCanceledJob.name);

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

  async handle(job: EventAutoCanceledJobType): Promise<void> {
    const { artistId, customerId, eventId, reason } = job.metadata;
    this.logger.log(`Handling ${EVENT_AUTO_CANCELED} for event ${eventId}, reason: ${reason}`);

    try {
      const [agendaEvent, artist, customer] = await Promise.all([
        this.agendaEventProvider.findById(eventId),
        this.artistProvider.findById(artistId),
        this.customerProvider.findById(customerId),
      ]);

      if (!agendaEvent || !artist || !customer) {
        this.logger.error(`Missing data for auto-canceled event notification: 
          Event: ${!!agendaEvent}, Artist: ${!!artist}, Customer: ${!!customer}`);
        return;
      }

      // Build notification content based on cancellation reason
      let title: string;
      let customerMessage: string;
      let artistMessage: string;

      switch (reason) {
        case 'NO_CONFIRMATION_48H':
          title = '❌ Cita Cancelada Automáticamente';
          customerMessage = `Tu cita "${agendaEvent.title}" con ${artist.username} fue cancelada porque no confirmaste dentro del tiempo límite (48 horas).`;
          artistMessage = `La cita "${agendaEvent.title}" con ${customer.firstName} fue cancelada automáticamente por falta de confirmación del cliente.`;
          break;
        case 'NO_CONSENT_SIGNED':
          title = '📋 Cita Cancelada - Sin Consentimiento';
          customerMessage = `Tu cita "${agendaEvent.title}" con ${artist.username} fue cancelada porque no firmaste el formulario de consentimiento requerido.`;
          artistMessage = `La cita "${agendaEvent.title}" con ${customer.firstName} fue cancelada automáticamente porque el cliente no firmó el consentimiento.`;
          break;
        default:
          title = '❌ Cita Cancelada';
          customerMessage = `Tu cita "${agendaEvent.title}" con ${artist.username} fue cancelada automáticamente.`;
          artistMessage = `La cita "${agendaEvent.title}" con ${customer.firstName} fue cancelada automáticamente.`;
      }

      // Store notification for customer
      await this.notificationStorageService.storeNotification(
        customer.userId,
        title,
        customerMessage,
        EVENT_AUTO_CANCELED,
        {
          eventId,
          artistId,
          artistName: artist.username,
          reason,
          canReschedule: reason !== 'NO_CONSENT_SIGNED', // Allow rescheduling except for consent issues
        },
      );

      // Store notification for artist
      await this.notificationStorageService.storeNotification(
        artist.userId,
        title,
        artistMessage,
        EVENT_AUTO_CANCELED,
        {
          eventId,
          customerId,
          customerName: customer.firstName,
          reason,
        },
      );

      // Email notification to customer
      const eventAutoCanceledEmailData: EventAutoCanceledEmailType = {
        to: customer.contactEmail,
        mailId: 'EVENT_AUTO_CANCELED',
        customerName: customer.firstName,
        artistName: artist.username,
        eventName: agendaEvent.title,
        eventDate: new Date(agendaEvent.startDate),
        reason,
      };

      await this.emailNotificationService.sendEmail(eventAutoCanceledEmailData);

      // Push notifications
      await Promise.all([
        this.pushNotificationService.sendToUser(
          customer.userId,
          {
            title,
            body: customerMessage,
          },
          {
            type: EVENT_AUTO_CANCELED,
            eventId,
            artistId,
            reason,
          },
        ),
        this.pushNotificationService.sendToUser(
          artist.userId,
          {
            title,
            body: artistMessage,
          },
          {
            type: EVENT_AUTO_CANCELED,
            eventId,
            customerId,
            reason,
          },
        ),
      ]);

      this.logger.log(`Successfully sent auto-cancellation notifications for event ${eventId}, reason: ${reason}`);

    } catch (error) {
      const e = error as Error;
      this.logger.error(`Error handling ${EVENT_AUTO_CANCELED} for event ${eventId}: ${e.message}`, e.stack);
    }
  }
} 