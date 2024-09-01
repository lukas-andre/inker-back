import { AgendaEventProvider } from '../../../../../agenda/infrastructure/providers/agendaEvent.provider';
import { QuotationProvider } from '../../../../../agenda/infrastructure/providers/quotation.provider';
import { ArtistProvider } from '../../../../../artists/infrastructure/database/artist.provider';
import { CustomerProvider } from '../../../../../customers/infrastructure/providers/customer.provider';
import { ArtistLocationProvider } from '../../../../../locations/infrastructure/database/artistLocation.provider';
import { EmailNotificationService } from '../../../../../notifications/services/email/email.notification';
import { QuotationRejectedType } from '../../../../../notifications/services/email/schemas/email';
import { QuotationRejectedJobType } from '../../../domain/schemas/quotation';
import { NotificationJob } from '../notification.job';

export class QuotationRejectedJob implements NotificationJob {
  constructor(
    private readonly emailNotificationService: EmailNotificationService,
    private readonly _1: AgendaEventProvider,
    private readonly artistProvider: ArtistProvider,
    private readonly customerProvider: CustomerProvider,
    private readonly _2: ArtistLocationProvider,
    private readonly quotationProvider: QuotationProvider,
  ) {}

  async handle(job: QuotationRejectedJobType): Promise<void> {
    const { artistId, customerId, quotationId } = job.metadata;
    const [quotation, artist, customer] = await Promise.all([
      this.quotationProvider.findById(quotationId),
      this.artistProvider.findByIdWithContact(artistId),
      this.customerProvider.findById(customerId),
    ]);

    const quotationRejectedEmailData: QuotationRejectedType = {
      to: artist.contact.email,
      artistName: artist.username,
      customerName: customer.firstName,
      rejectionReason: quotation.rejectReasonDetails,
      mailId: 'QUOTATION_REJECTED',
    };
    await this.emailNotificationService.sendEmail(quotationRejectedEmailData);
  }
}
