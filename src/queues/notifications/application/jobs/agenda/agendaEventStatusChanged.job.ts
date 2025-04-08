import { AgendaEventRepository } from '../../../../../agenda/infrastructure/repositories/agendaEvent.repository';
import { QuotationRepository } from '../../../../../agenda/infrastructure/repositories/quotation.provider';
import { ArtistRepository } from '../../../../../artists/infrastructure/repositories/artist.repository';
import { CustomerRepository } from '../../../../../customers/infrastructure/providers/customer.repository';
import { ArtistLocationRepository } from '../../../../../locations/infrastructure/database/artistLocation.repository';
import { EmailNotificationService } from '../../../../../notifications/services/email/email.notification';
import { AgendaEventStatusChangedType } from '../../../../../notifications/services/email/schemas/email';
import { NotificationStorageService } from '../../../../../notifications/services/notification.storage';
import { PushNotificationService } from '../../../../../notifications/services/push/pushNotification.service';
import { AgendaEventStatusChangedJobType } from '../../../domain/schemas/agenda';
import { NotificationJob } from '../notification.job';

export class AgendaEventStatusChangedJob extends NotificationJob {
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
      notificationStorageService
    );
  }

  async handle(job: AgendaEventStatusChangedJobType): Promise<void> {
    const { artistId, customerId, eventId, status, message } = job.metadata;

    // Fetch necessary data
    const [event, artist, customer] = await Promise.all([
      this.agendaEventProvider.findById(eventId),
      this.artistProvider.findById(artistId),
      this.customerProvider.findById(customerId),
    ]);

    if (!event || !artist || !customer) {
      console.error(`Missing data for event status changed notification: 
        Event: ${!!event}, Artist: ${!!artist}, Customer: ${!!customer}`);
      return;
    }

    // Build notification title and message
    const title = `Appointment Status: ${this.getStatusDisplayName(status)}`;
    const notificationMessage = message || `Your appointment status is now ${this.getStatusDisplayName(status)}`;
    
    // Store notification for customer in database
    await this.notificationStorageService.storeNotification(
      customer.userId,
      title,
      notificationMessage,
      'EVENT_STATUS_CHANGED',
      {
        eventId,
        artistId,
        status,
      },
    );

    // Store notification for artist in database
    await this.notificationStorageService.storeNotification(
      artist.userId,
      `Appointment Status Updated`,
      `Appointment with ${customer.firstName} is now ${this.getStatusDisplayName(status)}`,
      'EVENT_STATUS_CHANGED',
      {
        eventId,
        customerId,
        status,
      },
    );

    // Email notification
    const emailData: AgendaEventStatusChangedType = {
      to: customer.contactEmail,
      artistName: artist.username,
      customerName: customer.firstName,
      eventName: event.title,
      eventDate: event.startDate,
      eventStatus: status,
      mailId: 'EVENT_STATUS_CHANGED',
    };
    await this.emailNotificationService.sendEmail(emailData);

    // Push notification
    try {
      await this.pushNotificationService.sendToUser(
        customer.userId,
        {
          title,
          body: notificationMessage,
        },
        {
          eventId,
          status,
          type: 'EVENT_STATUS_CHANGED',
        },
      );
    } catch (error) {
      console.error('Failed to send push notification', error);
      // Continue execution even if push notification fails
    }
  }

  // Helper method to get user-friendly status names
  private getStatusDisplayName(status: string): string {
    const statusMap = {
      scheduled: 'Scheduled',
      in_progress: 'In Progress',
      completed: 'Completed',
      rescheduled: 'Rescheduled',
      waiting_for_photos: 'Waiting for Photos',
      waiting_for_review: 'Ready for Review',
      reviewed: 'Reviewed',
      canceled: 'Canceled',
    };

    return statusMap[status.toLowerCase()] || status;
  }
}