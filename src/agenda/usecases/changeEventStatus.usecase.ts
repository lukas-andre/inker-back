import { Injectable } from '@nestjs/common';

import { AgendaEventStatus } from '../domain/enum/agendaEventStatus.enum';
import {
  ARTIST_NOT_AUTHORIZED,
  CUSTOMER_NOT_AUTHORIZED,
  INVALID_EVENT_STATUS_TRANSITION,
} from '../domain/errors/codes';
import { DomainUnProcessableEntity } from '../../global/domain/exceptions/domain.exception';
import {
  BaseUseCase,
  UseCase,
} from '../../global/domain/usecases/base.usecase';
import { RequestContextService } from '../../global/infrastructure/services/requestContext.service';
import { ChangeEventStatusReqDto } from '../infrastructure/dtos/changeEventStatusReq.dto';
import { AgendaProvider } from '../infrastructure/providers/agenda.provider';
import { AgendaEventProvider } from '../infrastructure/providers/agendaEvent.provider';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { queues } from '../../queues/queues';

@Injectable()
export class ChangeEventStatusUsecase extends BaseUseCase implements UseCase {
  constructor(
    private readonly requestContext: RequestContextService,
    private readonly agendaProvider: AgendaProvider,
    private readonly agendaEventProvider: AgendaEventProvider,
    @InjectQueue(queues.notification.name)
    private readonly notificationsQueue: Queue,
  ) {
    super(ChangeEventStatusUsecase.name);
  }

  async execute(
    agendaId: number,
    eventId: number,
    { status, notes }: ChangeEventStatusReqDto,
  ): Promise<void> {
    const { isNotArtist, userTypeId, userId } = this.requestContext;

    if (isNotArtist) {
      throw new DomainUnProcessableEntity(ARTIST_NOT_AUTHORIZED);
    }

    // Check if the agenda belongs to the artist
    const agenda = await this.agendaProvider.findOne({
      where: { id: agendaId, artistId: userTypeId },
    });

    if (!agenda) {
      throw new DomainUnProcessableEntity(ARTIST_NOT_AUTHORIZED);
    }

    // Get current event
    const event = await this.agendaEventProvider.findOne({
      where: { id: eventId, agenda: { id: agendaId } },
    });

    if (!event) {
      throw new DomainUnProcessableEntity('Event not found');
    }

    // Validate the transition
    this.validateTransition(event.status, status);

    // Create event history record
    await this.agendaEventProvider.createEventHistoryWithNativeQuery(
      eventId,
      {
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate,
        color: event.color,
        info: notes || event.info,
        notification: event.notification,
        done: event.done,
        cancelationReason: event.cancelationReason,
        status: event.status,
      },
      userId,
    );

    // Update event status
    await this.agendaEventProvider.updateEventStatus(eventId, agendaId, status);

    // Notify customer about status change
    if (event.customerId) {
      await this.notifyCustomer(event.customerId, eventId, status);
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
    customerId: number,
    eventId: number,
    status: AgendaEventStatus,
  ): Promise<void> {
    try {
      // Get artist ID from the request context
      const { userTypeId: artistId } = this.requestContext;
      
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
            artistId,
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