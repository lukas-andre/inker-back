import { AgendaEventProvider } from '../../../../../agenda/infrastructure/providers/agendaEvent.provider';
import { QuotationProvider } from '../../../../../agenda/infrastructure/providers/quotation.provider';
import { ArtistProvider } from '../../../../../artists/infrastructure/database/artist.provider';
import { CustomerProvider } from '../../../../../customers/infrastructure/providers/customer.provider';
import { ArtistLocationProvider } from '../../../../../locations/infrastructure/database/artistLocation.provider';
import { EmailNotificationService } from '../../../../../notifications/services/email/email.notification';
import { QuotationCanceledType } from '../../../../../notifications/services/email/schemas/email';
import { QuotationCanceledJobType } from '../../../domain/schemas/quotation';
import {
  ArtistCancelReason,
  CancelReasonType,
  CustomerCancelReason,
  SystemCancelReason,
} from '../../../domain/schemas/quotationCancelReasons';
import { NotificationJob } from '../notification.job';

export class QuotationCanceledJob implements NotificationJob {
  constructor(
    private readonly emailNotificationService: EmailNotificationService,
    private readonly _1: AgendaEventProvider,
    private readonly artistProvider: ArtistProvider,
    private readonly customerProvider: CustomerProvider,
    private readonly _2: ArtistLocationProvider,
    private readonly quotationProvider: QuotationProvider,
  ) {}

  async handle(job: QuotationCanceledJobType): Promise<void> {
    const {
      artistId,
      customerId,
      quotationId,
      cancelReasonType,
      cancelReason,
      cancelReasonDetails,
      canceledBy,
    } = job.metadata;

    const [quotation, artist, customer] = await Promise.all([
      this.quotationProvider.findById(quotationId),
      this.artistProvider.findById(artistId),
      this.customerProvider.findById(customerId),
    ]);

    if (!quotation || !artist || !customer) {
      throw new Error('Required data not found');
    }

    const recipientEmail =
      cancelReasonType === 'artist'
        ? customer.contactEmail
        : artist.contact.email;
    const cancelMessage = this.generateCancelMessage(
      cancelReasonType,
      cancelReason,
      cancelReasonDetails,
    );

    const quotationCanceledEmailData: QuotationCanceledType = {
      to: recipientEmail,
      artistName: artist.username,
      customerName: customer.firstName,
      cancelMessage,
      canceledBy,
      mailId: 'QUOTATION_CANCELED',
    };

    await this.emailNotificationService.sendEmail(quotationCanceledEmailData);
  }

  private generateCancelMessage(
    cancelReasonType: CancelReasonType,
    cancelReason:
      | CustomerCancelReason
      | ArtistCancelReason
      | SystemCancelReason,
    cancelReasonDetails?: string,
  ): string {
    let message = '';

    switch (cancelReasonType) {
      case 'customer':
        message = `The customer has canceled the quotation due to: ${this.getCustomerCancelReasonText(
          cancelReason as CustomerCancelReason,
        )}`;
        break;
      case 'artist':
        message = `The artist has canceled the quotation due to: ${this.getArtistCancelReasonText(
          cancelReason as ArtistCancelReason,
        )}`;
        break;
      case 'system':
        message = `The quotation has been automatically canceled due to: ${this.getSystemCancelReasonText(
          cancelReason as SystemCancelReason,
        )}`;
        break;
    }

    if (cancelReasonDetails) {
      message += ` Additional details: ${cancelReasonDetails}`;
    }

    return message;
  }

  private getCustomerCancelReasonText(reason: CustomerCancelReason): string {
    const reasons = {
      change_of_mind: 'Change of mind',
      found_another_artist: 'Found another artist',
      financial_reasons: 'Financial reasons',
      personal_reasons: 'Personal reasons',
      other: 'Other reasons',
    };
    return reasons[reason] || 'Unknown reason';
  }

  private getArtistCancelReasonText(reason: ArtistCancelReason): string {
    const reasons = {
      scheduling_conflict: 'Scheduling conflict',
      artistic_disagreement: 'Artistic disagreement',
      health_reasons: 'Health reasons',
      equipment_issues: 'Equipment issues',
      other: 'Other reasons',
    };
    return reasons[reason] || 'Unknown reason';
  }

  private getSystemCancelReasonText(reason: SystemCancelReason): string {
    const reasons = {
      not_attended: 'Not attended',
    };
    return reasons[reason] || 'Unknown reason';
  }
}
