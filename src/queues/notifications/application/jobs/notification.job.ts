import { AgendaEventRepository } from '../../../../agenda/infrastructure/repositories/agendaEvent.repository';
import { QuotationRepository } from '../../../../agenda/infrastructure/repositories/quotation.provider';
import { ArtistRepository } from '../../../../artists/infrastructure/repositories/artist.repository';
import { CustomerRepository } from '../../../../customers/infrastructure/providers/customer.repository';
import { ArtistLocationRepository } from '../../../../locations/infrastructure/database/artistLocation.repository';
import { EmailNotificationService } from '../../../../notifications/services/email/email.notification';
import { NotificationStorageService } from '../../../../notifications/services/notification.storage';
import { PushNotificationService } from '../../../../notifications/services/push/pushNotification.service';
import { JobType } from '../../domain/schemas/job';

export abstract class NotificationJob {
  protected constructor(
    readonly emailNotificationService: EmailNotificationService,
    readonly agendaEventProvider: AgendaEventRepository,
    readonly artistProvider: ArtistRepository,
    readonly customerProvider: CustomerRepository,
    readonly locationProvider: ArtistLocationRepository,
    readonly quotationProvider: QuotationRepository,
    readonly pushNotificationService: PushNotificationService,
    readonly notificationStorageService: NotificationStorageService,
  ) {}

  abstract handle(job: JobType): Promise<void>;
}

export function getGoogleMapsLink(lat: number, lng: number): string {
  return `https://www.google.com/maps/@?api=1&map_action=map&center=${lat}%2C${lng}`;
}
