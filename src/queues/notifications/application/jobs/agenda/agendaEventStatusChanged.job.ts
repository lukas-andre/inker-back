import { AgendaEventProvider } from '../../../../../agenda/infrastructure/providers/agendaEvent.provider';
import { QuotationProvider } from '../../../../../agenda/infrastructure/providers/quotation.provider';
import { ArtistProvider } from '../../../../../artists/infrastructure/database/artist.provider';
import { CustomerProvider } from '../../../../../customers/infrastructure/providers/customer.provider';
import { ArtistLocationProvider } from '../../../../../locations/infrastructure/database/artistLocation.provider';
import { EmailNotificationService } from '../../../../../notifications/services/email/email.notification';
import { AgendaEventStatusChangedType } from '../../../../../notifications/services/email/schemas/email';
import { PushNotificationService } from '../../../../../notifications/services/push/pushNotification.service';
import { AgendaEventStatusChangedJobType } from '../../../domain/schemas/agenda';
import { NotificationJob } from '../notification.job';

export class AgendaEventStatusChangedJob implements NotificationJob {
  constructor(
    private readonly emailNotificationService: EmailNotificationService,
    private readonly agendaEventProvider: AgendaEventProvider,
    private readonly artistProvider: ArtistProvider,
    private readonly customerProvider: CustomerProvider,
    private readonly locationProvider: ArtistLocationProvider,
    private readonly _: QuotationProvider,
    private readonly pushNotificationService: PushNotificationService,
  ) {}

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
        customerId,
        {
          title: `Appointment Status: ${this.getStatusDisplayName(status)}`,
          body: message,
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