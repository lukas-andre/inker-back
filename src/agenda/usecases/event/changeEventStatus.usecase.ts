import { Injectable } from '@nestjs/common';

import { AgendaEventStatus } from '../../domain/enum/agendaEventStatus.enum';
import {
  ARTIST_NOT_AUTHORIZED,
  CUSTOMER_NOT_AUTHORIZED,
  INVALID_EVENT_STATUS_TRANSITION,
} from '../../domain/errors/codes';
import { DomainUnProcessableEntity } from '../../../global/domain/exceptions/domain.exception';
import {
  BaseUseCase,
  UseCase,
} from '../../../global/domain/usecases/base.usecase';
import { RequestContextService } from '../../../global/infrastructure/services/requestContext.service';
import { ChangeEventStatusReqDto } from '../../infrastructure/dtos/changeEventStatusReq.dto';
import { AgendaRepository } from '../../infrastructure/repositories/agenda.repository';
import { AgendaEventRepository } from '../../infrastructure/repositories/agendaEvent.repository';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { queues } from '../../../queues/queues';
import { IStatusLogEntry, UserType as DomainUserType } from '../../infrastructure/entities/agendaEvent.entity';

@Injectable()
export class ChangeEventStatusUsecase extends BaseUseCase implements UseCase {
  constructor(
    private readonly requestContext: RequestContextService,
    private readonly agendaProvider: AgendaRepository,
    private readonly agendaEventProvider: AgendaEventRepository,
    @InjectQueue(queues.notification.name)
    private readonly notificationsQueue: Queue,
  ) {
    super(ChangeEventStatusUsecase.name);
  }

  async execute(
    agendaId: string,
    eventId: string,
    { status, reason, notes, newStartDate, newEndDate }: ChangeEventStatusReqDto,
  ): Promise<void> {
    const { userTypeId: roleSpecificId, userId: authenticatedUserId, isNotArtist } = this.requestContext;

    // Get current event with its agenda to access artistId and customerId
    const event = await this.agendaEventProvider.findOne({
      where: { id: eventId }, 
      relations: ['agenda'],
    });

    if (!event) {
      throw new DomainUnProcessableEntity('Event not found');
    }
    
    // Ensure the event belongs to the provided agendaId
    if (event.agenda.id !== agendaId) {
        throw new DomainUnProcessableEntity('Event does not belong to the specified agenda.');
    }

    const eventArtistId = event.agenda.artistId;
    const eventCustomerId = event.customerId;

    let authorized = false;
    if (status === AgendaEventStatus.CANCELED || status === AgendaEventStatus.RESCHEDULED) {
      // For CANCELED or RESCHEDULED, either the artist or the customer of the event is authorized.
      if (!isNotArtist && roleSpecificId === eventArtistId) {
        authorized = true;
      } else if (isNotArtist && eventCustomerId && roleSpecificId === eventCustomerId) {
        authorized = true;
      }
    } else { // For other statuses, only the event's artist is authorized
      if (!isNotArtist && roleSpecificId === eventArtistId) {
        authorized = true;
      }
    }

    if (!authorized) {
      if (status === AgendaEventStatus.CANCELED || status === AgendaEventStatus.RESCHEDULED) {
        // More generic message for failed cancellation/reschedule authorization
        throw new DomainUnProcessableEntity(
          `User ${authenticatedUserId} is not authorized to ${status.toLowerCase()} this event.`
        );
      } else {
        throw new DomainUnProcessableEntity(ARTIST_NOT_AUTHORIZED);
      }
    }

    // Validate the transition
    this.validateTransition(event.status, status);

    // Update event status and log
    const currentUserRole: DomainUserType = isNotArtist ? 'customer' : 'artist';

    // Apply new dates if provided (typically for rescheduling)
    if (newStartDate) {
      event.startDate = newStartDate;
    }
    if (newEndDate) {
      event.endDate = newEndDate;
    }

    const newLogEntry: IStatusLogEntry = {
      status,
      timestamp: new Date(),
      actor: {
        userId: authenticatedUserId,
        roleId: roleSpecificId,
        role: currentUserRole,
      },
      reason: reason || undefined,
      notes: notes || undefined,
    };

    event.status = status;
    event.statusLog = event.statusLog ? [...event.statusLog, newLogEntry] : [newLogEntry];
    
    // Instead of updateEventStatus, we now save the modified event entity
    // which includes the new status and the updated statusLog.
    await this.agendaEventProvider.save(event);

    // Notify customer about status change
    if (event.customerId) {
      await this.notifyCustomer(event.customerId, eventId, status, eventArtistId);
    }
  }

  private validateTransition(
    currentStatus: AgendaEventStatus,
    newStatus: AgendaEventStatus,
  ): void {
    // Define valid transitions
    const validTransitions = {
      [AgendaEventStatus.SCHEDULED]: [
        AgendaEventStatus.IN_PROGRESS,
        AgendaEventStatus.RESCHEDULED,
        AgendaEventStatus.CANCELED,
      ],
      [AgendaEventStatus.RESCHEDULED]: [
        AgendaEventStatus.SCHEDULED,
        AgendaEventStatus.CANCELED,
      ],
      [AgendaEventStatus.IN_PROGRESS]: [
        AgendaEventStatus.COMPLETED,
        AgendaEventStatus.CANCELED,
      ],
      [AgendaEventStatus.COMPLETED]: [
        AgendaEventStatus.WAITING_FOR_PHOTOS,
      ],
      [AgendaEventStatus.WAITING_FOR_PHOTOS]: [
        AgendaEventStatus.WAITING_FOR_REVIEW,
      ],
      [AgendaEventStatus.WAITING_FOR_REVIEW]: [
        // Can't transition from here (customer must review)
      ],
      [AgendaEventStatus.REVIEWED]: [
        // Final state
      ],
      [AgendaEventStatus.CANCELED]: [
        // Final state
      ],
    };

    if (
      !validTransitions[currentStatus] ||
      !validTransitions[currentStatus].includes(newStatus)
    ) {
      throw new DomainUnProcessableEntity(
        `${INVALID_EVENT_STATUS_TRANSITION}: Cannot transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }

  private async notifyCustomer(
    customerId: string,
    eventId: string,
    status: AgendaEventStatus,
    artistIdForNotification: string, // Added parameter for event's artistId
  ): Promise<void> {
    try {
      // Get artist ID from the request context - REMOVED
      // const { userTypeId: artistId } = this.requestContext; 
      
      // Choose the appropriate notification message based on status
      let message: string;
      
      switch (status) {
        case AgendaEventStatus.IN_PROGRESS:
          message = 'Your tattoo session has started';
          break;
        case AgendaEventStatus.COMPLETED:
          message = 'Your tattoo session has been completed';
          break;
        case AgendaEventStatus.WAITING_FOR_PHOTOS:
          message = 'The artist is uploading photos of your tattoo';
          break;
        case AgendaEventStatus.WAITING_FOR_REVIEW:
          message = 'Please review your tattoo session';
          break;
        case AgendaEventStatus.RESCHEDULED:
          message = 'Your appointment has been rescheduled';
          break;
        case AgendaEventStatus.CANCELED:
          message = 'Your appointment has been canceled';
          break;
        default:
          message = `Your appointment status has been updated to ${status}`;
      }

      // Add the job to the queue with the correct structure
      await this.notificationsQueue.add(
        {
          jobId: 'EVENT_STATUS_CHANGED',
          notificationTypeId: 'EMAIL',
          metadata: {
            eventId,
            customerId,
            artistId: artistIdForNotification, // Use passed artistIdForNotification
            status,
            message,
          },
        },
        { 
          removeOnComplete: true,
          attempts: 3,
        },
      );
    } catch (error) {
      this.logger.error(
        `Failed to send notification to customer ${customerId}`,
        error,
      );
    }
  }
}