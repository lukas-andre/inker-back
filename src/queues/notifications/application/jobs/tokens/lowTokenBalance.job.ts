import { EmailNotificationService } from '../../../../../notifications/services/email/email.notification';
import { NotificationStorageService } from '../../../../../notifications/services/notification.storage';
import { PushNotificationService } from '../../../../../notifications/services/push/pushNotification.service';
import { LowTokenBalanceJobType } from '../../../domain/schemas/tokens';
import { NotificationJob } from '../notification.job';
import { AgendaEventRepository } from '../../../../../agenda/infrastructure/repositories/agendaEvent.repository';
import { QuotationRepository } from '../../../../../agenda/infrastructure/repositories/quotation.provider';
import { ArtistRepository } from '../../../../../artists/infrastructure/repositories/artist.repository';
import { CustomerRepository } from '../../../../../customers/infrastructure/providers/customer.repository';
import { ArtistLocationRepository } from '../../../../../locations/infrastructure/database/artistLocation.repository';
import { UserType } from '../../../../../users/domain/enums/userType.enum';

export class LowTokenBalanceJob extends NotificationJob {
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

  async handle(job: LowTokenBalanceJobType): Promise<void> {
    const { currentBalance, threshold } = job.metadata;
    const { userId, userTypeId } = job;

    // Determine user type and fetch user data
    let userEmail: string;
    let userName: string;
    
    // Try to find user in customer or artist repositories based on userTypeId
    const customer = await this.customerProvider.findById(userTypeId);
    if (customer) {
      userEmail = customer.contactEmail;
      userName = customer.firstName || customer.contactEmail;
    } else {
      const artist = await this.artistProvider.findById(userTypeId);
      if (artist) {
        userEmail = artist.contact.email;
        userName = artist.username || artist.contact.email;
      } else {
        console.error(`User not found for low token balance notification: ${userId}`);
        return;
      }
    }

    // Build notification title and message
    const title = 'Low Token Balance';
    const notificationMessage = `Your token balance is running low. You have ${currentBalance} tokens remaining. Purchase more tokens to continue generating tattoo designs!`;

    // Store notification in database
    await this.notificationStorageService.storeNotification(
      userId,
      title,
      notificationMessage,
      'LOW_TOKEN_BALANCE',
      {
        currentBalance,
        threshold,
        userTypeId,
      },
    );

    // Email notification
    const emailData = {
      to: userEmail,
      userName,
      currentBalance,
      threshold,
      mailId: 'LOW_TOKEN_BALANCE' as const,
    };
    
    try {
      await this.emailNotificationService.sendEmail(emailData);
    } catch (error) {
      console.error('Failed to send low token balance email', error);
    }

    // Push notification
    try {
      await this.pushNotificationService.sendToUser(
        userId,
        {
          title,
          body: notificationMessage,
        },
        {
          currentBalance,
          type: 'LOW_TOKEN_BALANCE',
        },
      );
    } catch (error) {
      console.error('Failed to send push notification for low token balance', error);
      // Continue execution even if push notification fails
    }
  }
}