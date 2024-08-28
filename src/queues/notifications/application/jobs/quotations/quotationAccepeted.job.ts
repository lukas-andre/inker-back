import { AgendaEventProvider } from '../../../../../agenda/infrastructure/providers/agendaEvent.provider';
import { QuotationProvider } from '../../../../../agenda/infrastructure/providers/quotation.provider';
import { ArtistProvider } from '../../../../../artists/infrastructure/database/artist.provider';
import { CustomerProvider } from '../../../../../customers/infrastructure/providers/customer.provider';
import { ArtistLocationProvider } from '../../../../../locations/infrastructure/database/artistLocation.provider';
import { EmailNotificationService } from '../../../../../notifications/services/email/email.notification';
import { QuotationAcceptedType } from '../../../../../notifications/services/email/schemas/email';
import { QuotationAcceptedJobType } from '../../../domain/schemas/quotation';
import { NotificationJob } from '../notification.job';

export class QuotationAcceptedJob implements NotificationJob {
  constructor(
    private readonly emailNotificationService: EmailNotificationService,
    private readonly _1: AgendaEventProvider,
    private readonly artistProvider: ArtistProvider,
    private readonly customerProvider: CustomerProvider,
    private readonly _2: ArtistLocationProvider,
    private readonly quotationProvider: QuotationProvider,
  ) {}

  async handle(job: QuotationAcceptedJobType): Promise<void> {
    const { artistId, customerId, quotationId } = job.metadata;
    const [quotation, artist, customer] = await Promise.all([
      this.quotationProvider.findById(quotationId),
      this.artistProvider.findByIdWithContact(artistId),
      this.customerProvider.findById(customerId),
    ]);

    const quotationAcceptedEmailData: QuotationAcceptedType = {
      to: artist.contact.email,
      artistName: artist.username,
      customerName: customer.firstName,
      estimatedCost: quotation.estimatedCost,
      appointmentDate: quotation.appointmentDate,
      appointmentDuration: quotation.appointmentDuration,
      mailId: 'QUOTATION_ACCEPTED',
    };

    await this.emailNotificationService.sendEmail(quotationAcceptedEmailData);
  }
}
