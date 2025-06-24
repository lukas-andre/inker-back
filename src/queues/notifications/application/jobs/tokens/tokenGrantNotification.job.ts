import { EmailNotificationService } from '../../../../../notifications/services/email/email.notification';
import { NotificationStorageService } from '../../../../../notifications/services/notification.storage';
import { PushNotificationService } from '../../../../../notifications/services/push/pushNotification.service';
import { TokenGrantNotificationJobType } from '../../../domain/schemas/tokens';
import { NotificationJob } from '../notification.job';
import { AgendaEventRepository } from '../../../../../agenda/infrastructure/repositories/agendaEvent.repository';
import { QuotationRepository } from '../../../../../agenda/infrastructure/repositories/quotation.provider';
import { ArtistRepository } from '../../../../../artists/infrastructure/repositories/artist.repository';
import { CustomerRepository } from '../../../../../customers/infrastructure/providers/customer.repository';
import { ArtistLocationRepository } from '../../../../../locations/infrastructure/database/artistLocation.repository';
export class TokenGrantNotificationJob extends NotificationJob {
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

  async handle(job: TokenGrantNotificationJobType): Promise<void> {
    const { 
      
      tokensGranted,
      reason,
      newBalance,
      grantedBy
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
        console.error(`User not found for token grant notification: ${job.userTypeId}`);
        return;
      }
    }

    // Build notification title and message
    const title = 'Tokens Received!';
    const notificationMessage = `You have received ${tokensGranted} tokens. ${reason}. Your new balance is ${newBalance} tokens.`;

    // Store notification in database
    await this.notificationStorageService.storeNotification(
      job.userId,
      title,
      notificationMessage,
      'TOKEN_GRANT_NOTIFICATION',
      {
        tokensGranted,
        reason,
        newBalance,
        userTypeId: job.userTypeId,
        grantedBy,
      },
    );

    // Email notification
    const emailData = {
      to: userEmail,
      userName,
      tokensGranted,
      reason,
      newBalance,
      grantDate: new Date(),
      mailId: 'TOKEN_GRANT_NOTIFICATION' as const,
    };
    
    try {
      await this.emailNotificationService.sendEmail(emailData);
    } catch (error) {
      console.error('Failed to send token grant notification email', error);
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
          tokensGranted,
          newBalance,
          type: 'TOKEN_GRANT_NOTIFICATION',
        },
      );
    } catch (error) {
      console.error('Failed to send push notification for token grant', error);
      // Continue execution even if push notification fails
    }
  }
}