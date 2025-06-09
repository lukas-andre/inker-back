import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import {
  BaseUseCase,
  UseCase,
} from '../../../global/domain/usecases/base.usecase';
import { AgendaEventRepository } from '../../infrastructure/repositories/agendaEvent.repository';
import { SendEventMessageReqDto } from '../../infrastructure/dtos/sendEventMessageReq.dto';
import { DomainNotFound, DomainForbidden } from '../../../global/domain/exceptions/domain.exception';
import { AgendaEvent, EventMessage } from '../../infrastructure/entities/agendaEvent.entity';
import { RequestContextService } from '../../../global/infrastructure/services/requestContext.service';
import { UserType } from '../../../users/domain/enums/userType.enum';
import { MultimediasService, UploadToS3Result } from '../../../multimedias/services/multimedias.service';
import { FileInterface } from '../../../multimedias/interfaces/file.interface';
import { AGENDA_EVENT_NOT_EXISTS } from '../../domain/errors/codes';
import { AgendaEventStatus } from '../../domain/enum/agendaEventStatus.enum';
import { NewEventMessageJobId } from '../../../queues/notifications/domain/schemas/agenda';
import { randomUUID } from 'crypto';

@Injectable()
export class SendEventMessageUseCase extends BaseUseCase implements UseCase {
  constructor(
    private readonly agendaEventRepo: AgendaEventRepository,
    private readonly multimediaService: MultimediasService,
    private readonly contextService: RequestContextService,
    @InjectQueue('notification') private readonly notificationQueue: Queue,
  ) {
    super(SendEventMessageUseCase.name);
  }

  async execute(
    eventId: string,
    dto: SendEventMessageReqDto,
    imageFile?: FileInterface, // Optional image file
  ): Promise<AgendaEvent> {
    const { userId, userTypeId, userType } = this.contextService;

    if (!userId || !userTypeId || !userType) {
      throw new UnauthorizedException('User context not found. Ensure JWT is processed and RequestContextService is populated.');
    }

    const event = await this.agendaEventRepo.findOne({
      where: { id: eventId },
      relations: ['agenda'], // Need agenda to get artistId
    });

    if (!event) {
      throw new DomainNotFound(AGENDA_EVENT_NOT_EXISTS);
    }
    if (!event.agenda) {
        this.logger.error(`Agenda relationship not loaded for event ${eventId}`);
        throw new DomainNotFound('Event agenda details not found.');
    }

    // Authorization Check
    const isCustomer = userType === UserType.CUSTOMER && event.customerId === userTypeId;
    const isArtist = userType === UserType.ARTIST && event.agenda.artistId === userTypeId;

    if (!isCustomer && !isArtist) {
      throw new ForbiddenException(
        'User is not authorized to send messages to this event',
      );
    }

    // Check if event status allows sending messages
    const allowedMessageStatuses = [
      AgendaEventStatus.CREATED,          // Event just created
      AgendaEventStatus.PENDING_CONFIRMATION, // Waiting for customer confirmation
      AgendaEventStatus.CONFIRMED,        // Event confirmed, equivalent to scheduled
      AgendaEventStatus.RESCHEDULED,
      AgendaEventStatus.IN_PROGRESS,
      AgendaEventStatus.WAITING_FOR_PHOTOS, // Artist might communicate about photos
      AgendaEventStatus.AFTERCARE_PERIOD, // Allow communication during aftercare
    ];

    if (!allowedMessageStatuses.includes(event.status)) {
      throw new DomainForbidden(
        `Messages cannot be sent to an event with status: ${event.status}`,
      );
    }

    let imageUrl: string | undefined = undefined;
    if (imageFile) {
      try {
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const safeOriginalName = imageFile.originalname.replace(
          /[^a-zA-Z0-9_.-]/g,
          '_',
        );
        const uniqueFileName = `${timestamp}-${randomSuffix}-${safeOriginalName}`;
        const agendaIdForPath = event.agenda?.id || 'unknown-agenda';
        const path = `agendas/${agendaIdForPath}/events/${eventId}/messages`;
        const uploadedImage: UploadToS3Result = await this.multimediaService.upload(
          imageFile,
          path,
          uniqueFileName,
        );
        imageUrl = uploadedImage.cloudFrontUrl;
        this.logger.log(`Image uploaded for event message: ${imageUrl}`);
      } catch (error) {
        this.logger.error('Error uploading image for event message', error);
      }
    }

    const newMessage: EventMessage = {
      id: randomUUID(),
      eventId,
      senderId: userTypeId, 
      senderType: isArtist ? 'artist' : 'customer',
      message: dto.message,
      imageUrl: imageUrl,
      createdAt: new Date(),
    };

    event.messages = [...(event.messages || []), newMessage];
    
    const eventToSave = { ...event };
    delete eventToSave.agenda;

    const updatedEvent = await this.agendaEventRepo.save(eventToSave as AgendaEvent);

    this.logger.log(
      `Message sent by ${newMessage.senderType} (${userTypeId}) on event ${eventId}`,
    );

    // --- Notification Logic ---
    try {
      const receiverUserTypeId = isArtist ? event.customerId : event.agenda.artistId;
      if (receiverUserTypeId) {
        const jobPayload = {
          eventId: event.id,
          agendaId: event.agenda.id, // event.agenda should be available due to relations
          senderId: userTypeId, // This is the sender's userTypeId (artistId or customerId)
          senderUserType: userType,
          receiverUserTypeId: receiverUserTypeId,
          messageSnippet: newMessage.message.substring(0, 100), // First 100 chars
          // senderName: // Could fetch sender's name here if needed
        };
        await this.notificationQueue.add(NewEventMessageJobId, jobPayload);
        this.logger.log(`Notification job added to queue for event ${eventId}, receiver ${receiverUserTypeId}`);
      }
    } catch (error) {
      this.logger.error(`Failed to add notification job for event ${eventId}`, error);
    }
    // --- End Notification Logic ---

    return updatedEvent;
  }
} 