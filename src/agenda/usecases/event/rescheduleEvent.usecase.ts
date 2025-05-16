import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { Connection } from 'typeorm';
import { InjectConnection } from '@nestjs/typeorm';
import { AGENDA_DB_CONNECTION_NAME } from '../../../databases/constants';
import { AgendaRepository } from '../../infrastructure/repositories/agenda.repository';
import { AgendaEventRepository } from '../../infrastructure/repositories/agendaEvent.repository';
import { RescheduleEventReqDto } from '../../infrastructure/dtos/rescheduleEventReq.dto';
import { AgendaEventStatus } from '../../domain/enum/agendaEventStatus.enum';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { queues } from '../../../queues/queues';
import { SchedulingService } from '../../services/scheduling.service';
import { ChangeEventStatusUsecase } from './changeEventStatus.usecase';
import { AgendaEvent } from '../../infrastructure/entities/agendaEvent.entity';

@Injectable()
export class RescheduleEventUseCase {
  private readonly logger = new Logger(RescheduleEventUseCase.name);

  constructor(
    private readonly agendaProvider: AgendaRepository,
    private readonly agendaEventProvider: AgendaEventRepository,
    private readonly schedulingService: SchedulingService,
    @InjectQueue(queues.notification.name) private notificationQueue: Queue,
    private readonly changeEventStatusUsecase: ChangeEventStatusUsecase,
  ) {}

  async execute(
    agendaId: string,
    eventId: string,
    dto: RescheduleEventReqDto,
    userId: string,
  ): Promise<void> {
    this.logger.log(
      `Rescheduling event ${eventId} for agenda ${agendaId} by user ${userId}`,
    );

    const event = await this.agendaEventProvider.findOne({
      where: { id: eventId },
      relations: ['agenda'],
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    if (event.agenda.id !== agendaId) {
      throw new BadRequestException(
        `Event ${eventId} does not belong to agenda ${agendaId}`,
      );
    }

    // Get artist ID for validation and authorization
    const artistId = event.agenda.artistId;

    // Authorization: Check if the acting user is the artist of the event.
    if (userId !== artistId) {
      throw new BadRequestException(
        'User is not authorized to reschedule this event. Only the artist can reschedule.',
      );
    }

    // The RequestContext in ChangeEventStatusUsecase will determine the actor.

    // Check if event can be rescheduled
    if (
      event.status === AgendaEventStatus.COMPLETED ||
      event.status === AgendaEventStatus.CANCELED
    ) {
      throw new BadRequestException(
        `Event with status ${event.status} cannot be rescheduled`,
      );
    }

    // Validate that the new time slot is available
    const duration = Math.ceil(
      (dto.newEndDate.getTime() - dto.newStartDate.getTime()) / (1000 * 60),
    );

    const validationResult =
      await this.schedulingService.validateAppointmentTime(
        artistId, // Assuming reschedule is done by/on behalf of the artist for slot checking
        dto.newStartDate,
        duration,
      );

    if (!validationResult.valid) {
      throw new BadRequestException(
        `Cannot reschedule to this time: ${validationResult.reason}`,
      );
    }

    // Store old start date for notification before updating
    const oldStartDate = event.startDate;

    // No direct update to event.startDate or event.endDate here anymore.
    // No direct queryRunner.manager.update(...) call.

    // Call ChangeEventStatusUsecase to handle date updates, status change, and logging
    await this.changeEventStatusUsecase.execute(agendaId, eventId, {
      status: AgendaEventStatus.RESCHEDULED,
      reason: dto.reason,
      newStartDate: dto.newStartDate,
      newEndDate: dto.newEndDate,
    });

    // Queue specific notification for reschedule
    // event.customerId should be from the initially fetched event which is still valid
    // artistId is also from the fetched event.agenda
    if (event.customerId) {
      await this.notificationQueue.add({
        jobId: 'EVENT_RESCHEDULED',
        metadata: {
          eventId,
          artistId, // This was from event.agenda.artistId
          customerId: event.customerId,
          oldStartDate: oldStartDate, // Use the stored old start date
          newStartDate: dto.newStartDate,
          reason: dto.reason,
        },
      });
    }
    // No explicit transaction commit/rollback/release needed here anymore,
    // as ChangeEventStatusUsecase handles the save.
  }
}