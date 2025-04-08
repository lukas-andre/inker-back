import { AgendaEventRepository } from '../../../../../agenda/infrastructure/repositories/agendaEvent.repository';
import { QuotationRepository } from '../../../../../agenda/infrastructure/repositories/quotation.provider';
import { ArtistRepository } from '../../../../../artists/infrastructure/repositories/artist.repository';
import { CustomerRepository } from '../../../../../customers/infrastructure/providers/customer.repository';
import { ArtistLocationRepository } from '../../../../../locations/infrastructure/database/artistLocation.repository';
import { EmailNotificationService } from '../../../../../notifications/services/email/email.notification';
import { NotificationStorageService } from '../../../../../notifications/services/notification.storage';
import { PushNotificationService } from '../../../../../notifications/services/push/pushNotification.service';
import { RsvpUnschedulableJobType } from '../../../domain/schemas/agenda';
import { NotificationJob } from '../notification.job';

export class RsvpUnschedulableJob implements NotificationJob {
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
  async handle(job: RsvpUnschedulableJobType): Promise<void> {
    console.log(
      `Handling EMAIL for RSVP unschedulable for customer ${job.jobId}`,
    );
    
    const { artistId, customerId, eventId } = job.metadata;
    
    try {
      const [agendaEvent, artist, customer] = await Promise.all([
        this.agendaEventProvider.findById(eventId),
        this.artistProvider.findById(artistId),
        this.customerProvider.findById(customerId),
      ]);

      if (!agendaEvent || !artist || !customer) {
        console.error(`Missing data for RSVP unschedulable notification: 
          Event: ${!!agendaEvent}, Artist: ${!!artist}, Customer: ${!!customer}`);
        return;
      }

      // Build notification title and message
      const title = `Appointment Cannot Be Scheduled`;
      const message = `The appointment "${agendaEvent.title}" cannot be scheduled at this time.`;

      // Store notification for customer
      await this.notificationStorageService.storeNotification(
        customerId,
        title,
        message,
        'RSVP_UNSCHEDULABLE',
        {
          eventId,
          artistId,
          artistName: artist.username,
        },
      );

      // Store notification for artist
      await this.notificationStorageService.storeNotification(
        artistId,
        title,
        `The appointment "${agendaEvent.title}" with ${customer.firstName} cannot be scheduled.`,
        'RSVP_UNSCHEDULABLE',
        {
          eventId,
          customerId,
          customerName: customer.firstName,
        },
      );

      // Push notification to customer
      try {
        await this.pushNotificationService.sendToUser(
          customerId,
          {
            title,
            body: message,
          },
          {
            eventId,
            type: 'RSVP_UNSCHEDULABLE',
          },
        );
      } catch (error) {
        console.error('Failed to send push notification to customer', error);
      }
    } catch (error) {
      console.error('Error handling RSVP unschedulable notification:', error);
    }
  }
}
