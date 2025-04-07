import { JobType } from '../../domain/schemas/job';
import { NotificationStorageService } from '../../../../notifications/services/notification.storage';
import { AgendaEventProvider } from '../../../../agenda/infrastructure/providers/agendaEvent.provider';
import { QuotationProvider } from '../../../../agenda/infrastructure/providers/quotation.provider';
import { ArtistProvider } from '../../../../artists/infrastructure/database/artist.provider';
import { CustomerProvider } from '../../../../customers/infrastructure/providers/customer.provider';
import { ArtistLocationProvider } from '../../../../locations/infrastructure/database/artistLocation.provider';
import { EmailNotificationService } from '../../../../notifications/services/email/email.notification';
import { PushNotificationService } from '../../../../notifications/services/push/pushNotification.service';

export abstract class NotificationJob {
  protected constructor(
    readonly emailNotificationService: EmailNotificationService,
    readonly agendaEventProvider: AgendaEventProvider,
    readonly artistProvider: ArtistProvider,
    readonly customerProvider: CustomerProvider,
    readonly locationProvider: ArtistLocationProvider,
    readonly quotationProvider: QuotationProvider,
    readonly pushNotificationService: PushNotificationService,
    readonly notificationStorageService: NotificationStorageService,
  ) {}

  abstract handle(job: JobType): Promise<void>;
}

export function getGoogleMapsLink(lat: number, lng: number): string {
  return `https://www.google.com/maps/@?api=1&map_action=map&center=${lat}%2C${lng}`;
}
