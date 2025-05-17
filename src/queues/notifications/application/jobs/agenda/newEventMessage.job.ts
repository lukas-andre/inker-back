import { Injectable, Logger } from '@nestjs/common';
import { NotificationJob } from '../notification.job';
import { AgendaEventRepository } from '../../../../../agenda/infrastructure/repositories/agendaEvent.repository';
import { ArtistRepository } from '../../../../../artists/infrastructure/repositories/artist.repository';
import { QuotationRepository } from '../../../../../agenda/infrastructure/repositories/quotation.provider';
import { PushNotificationService } from '../../../../../notifications/services/push/pushNotification.service';
import { UserType } from '../../../../../users/domain/enums/userType.enum';
import { CustomerRepository } from '../../../../../customers/infrastructure/providers/customer.repository';
import { ArtistLocationRepository } from '../../../../../locations/infrastructure/database/artistLocation.repository';
import { NotificationStorageService } from '../../../../../notifications/services/notification.storage';
import { EmailNotificationService } from '../../../../../notifications/services/email/email.notification';
import { NewEventMessageJob as NewEventMessageJobPayload, NewEventMessageJobId } from '../../../domain/schemas/agenda';

@Injectable()
export class NewEventMessageJob extends NotificationJob {
  private readonly logger = new Logger(NewEventMessageJob.name);

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

  async handle(job: NewEventMessageJobPayload): Promise<void> {
    const { eventId, senderId, senderUserType, receiverUserTypeId, messageSnippet, senderName: initialSenderName, agendaId } = job.metadata;
    this.logger.log(`Handling ${NewEventMessageJobId} for event ${eventId}, from sender ${senderId} (${senderUserType}) to receiver ID ${receiverUserTypeId}`);

    try {
      let receiverGlobalUserId: string | undefined;
      let receiverExists = false;

      // receiverUserTypeId is the ID of the Artist or Customer entity.
      // senderId is the global user ID of the sender.
      if (senderUserType === UserType.ARTIST) {
        // Sender is Artist, so receiver is Customer
        const customer = await this.customerProvider.findById(receiverUserTypeId); // Use findById with customer's own ID
        if (customer && customer.userId) {
          receiverGlobalUserId = customer.userId;
          receiverExists = true;
        } else {
          this.logger.error(`Receiver (Customer) not found or has no userId for customerId ${receiverUserTypeId}.`);
        }
      } else if (senderUserType === UserType.CUSTOMER) {
        // Sender is Customer, so receiver is Artist
        const artist = await this.artistProvider.findById(receiverUserTypeId); // Use findById with artist's own ID
        if (artist && artist.userId) {
          receiverGlobalUserId = artist.userId;
          receiverExists = true;
        } else {
          this.logger.error(`Receiver (Artist) not found or has no userId for artistId ${receiverUserTypeId}.`);
        }
      } else {
        this.logger.error(`Unknown senderUserType: ${senderUserType}. Cannot determine receiver type.`);
        return;
      }

      if (!receiverExists || !receiverGlobalUserId) {
        this.logger.error(`Failed to identify receiverGlobalUserId for receiverUserTypeId ${receiverUserTypeId}. Aborting notification.`);
        return;
      }

      let finalSenderName = initialSenderName;
      if (!finalSenderName) {
        if (senderUserType === UserType.ARTIST) {
          const artist = await this.artistProvider.findOne({ where: { userId: senderId } });
          if (artist) {
            finalSenderName = artist.firstName || artist.username || 'Artist';
          } else {
            finalSenderName = 'Artist'; // Fallback if artist not found by global senderId
          }
        } else if (senderUserType === UserType.CUSTOMER) {
          const customer = await this.customerProvider.findOne({ where: { userId: senderId } });
          if (customer) {
            finalSenderName = customer.firstName || 'Customer'; // Customer might not have username directly
          } else {
            finalSenderName = 'Customer'; // Fallback if customer not found by global senderId
          }
        } else {
          finalSenderName = 'System'; // Default for other types like SYSTEM if any
        }
      }

      const title = `New message from ${finalSenderName}`;
      const body = messageSnippet;
      const pushDataPayload = {
        type: NewEventMessageJobId,
        eventId: eventId,
        agendaId: agendaId,
        senderId: senderId, 
        senderUserType: senderUserType.toString(),
      };

      await this.pushNotificationService.sendToUser(
        receiverGlobalUserId,
        { title, body },
        pushDataPayload,
      );
      this.logger.log(`Push notification sent to user ${receiverGlobalUserId} for event ${eventId}`);

      await this.notificationStorageService.storeNotification(
        receiverGlobalUserId,
        title,
        body,
        NewEventMessageJobId,
        pushDataPayload,
      );
      this.logger.log(`Notification stored for user ${receiverGlobalUserId}`);

    } catch (error) {
      const e = error as Error;
      this.logger.error(`Error handling ${NewEventMessageJobId} for event ${eventId}: ${e.message}`, e.stack);
    }
  }
} 