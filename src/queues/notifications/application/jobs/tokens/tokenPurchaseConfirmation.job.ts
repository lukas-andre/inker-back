import { EmailNotificationService } from '../../../../../notifications/services/email/email.notification';
import { NotificationStorageService } from '../../../../../notifications/services/notification.storage';
import { PushNotificationService } from '../../../../../notifications/services/push/pushNotification.service';
import { TokenPurchaseConfirmationJobType } from '../../../domain/schemas/tokens';
import { NotificationJob } from '../notification.job';
import { AgendaEventRepository } from '../../../../../agenda/infrastructure/repositories/agendaEvent.repository';
import { QuotationRepository } from '../../../../../agenda/infrastructure/repositories/quotation.provider';
import { ArtistRepository } from '../../../../../artists/infrastructure/repositories/artist.repository';
import { CustomerRepository } from '../../../../../customers/infrastructure/providers/customer.repository';
import { ArtistLocationRepository } from '../../../../../locations/infrastructure/database/artistLocation.repository';
export class TokenPurchaseConfirmationJob extends NotificationJob {
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

  async handle(job: TokenPurchaseConfirmationJobType): Promise<void> {
    const { 
      transactionId,
      packageName,
      tokensAmount,
      price,
      currency,
      newBalance,
      paymentMethod
    } = job.metadata;

    // Determine user type and fetch user data
    let userEmail: string;
    let userName: string;
    
    // Try to find user in customer or artist repositories based on userTypeId
    const customer = await this.customerProvider.findById(job.userTypeId);
    if (customer) {
      userEmail = customer.contactEmail;
      userName = customer.firstName || customer.contactEmail;
    } else {
      const artist = await this.artistProvider.findById(job.userTypeId);
      if (artist) {
        userEmail = artist.contact.email;
        userName = artist.username || artist.contact.email;
      } else {
        console.error(`User not found for token purchase confirmation: ${job.userTypeId}`);
        return;
      }
    }

    // Build notification title and message
    const title = 'Token Purchase Successful';
    const notificationMessage = `Your purchase of ${tokensAmount} tokens has been confirmed. Your new balance is ${newBalance} tokens.`;

    // Store notification in database
    await this.notificationStorageService.storeNotification(
      job.userId,
      title,
      notificationMessage,
      'TOKEN_PURCHASE_CONFIRMATION',
      {
        transactionId,
        packageName,
        tokensAmount,
        price,
        currency,
        newBalance,
        userTypeId: job.userTypeId,
      },
    );

    // Format price for display
    const formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(price);

    // Email notification
    const emailData = {
      to: userEmail,
      userName,
      transactionId,
      packageName,
      tokensAmount,
      price: formattedPrice,
      newBalance,
      paymentMethod: paymentMethod || 'Card',
      purchaseDate: new Date(),
      mailId: 'TOKEN_PURCHASE_CONFIRMATION' as const,
    };
    
    try {
      await this.emailNotificationService.sendEmail(emailData);
    } catch (error) {
      console.error('Failed to send token purchase confirmation email', error);
    }

    // Push notification
    try {
      await this.pushNotificationService.sendToUser(
        job.userId,
        {
          title,
          body: notificationMessage,
        },
        {
          transactionId,
          tokensAmount,
          newBalance,
          type: 'TOKEN_PURCHASE_CONFIRMATION',
        },
      );
    } catch (error) {
      console.error('Failed to send push notification for token purchase', error);
      // Continue execution even if push notification fails
    }
  }
}