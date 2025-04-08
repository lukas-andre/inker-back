import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { Connection } from 'typeorm';
import { InjectConnection } from '@nestjs/typeorm';
import { AGENDA_DB_CONNECTION_NAME } from '../../databases/constants';
import { AgendaRepository } from '../infrastructure/repositories/agenda.repository';
import { AgendaEventRepository } from '../infrastructure/repositories/agendaEvent.repository';
import { RescheduleEventReqDto } from '../infrastructure/dtos/rescheduleEventReq.dto';
import { AgendaEventStatus } from '../domain/enum/agendaEventStatus.enum';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { queues } from '../../queues/queues';
import { SchedulingService } from '../services/scheduling.service';

@Injectable()
export class RescheduleEventUseCase {
  private readonly logger = new Logger(RescheduleEventUseCase.name);

  constructor(
    private readonly agendaProvider: AgendaRepository,
    private readonly agendaEventProvider: AgendaEventRepository,
    private readonly schedulingService: SchedulingService,
    @InjectConnection(AGENDA_DB_CONNECTION_NAME)
    private connection: Connection,
    @InjectQueue(queues.notification.name) private notificationQueue: Queue,
  ) {}

  async execute(
    agendaId: string,
    eventId: string,
    dto: RescheduleEventReqDto,
    userId: string,
  ): Promise<void> {
    this.logger.log(`Rescheduling event ${eventId} for agenda ${agendaId}`);

    // Verify event exists and belongs to the agenda
    const event = await this.agendaEventProvider.findOne({
      where: { id: eventId },
      relations: ['agenda'],
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    if (event.agenda.id !== agendaId) {
      throw new BadRequestException(`Event ${eventId} does not belong to agenda ${agendaId}`);
    }

    // Check if event can be rescheduled (only if it's not done, canceled, etc.)
    if (
      event.status === AgendaEventStatus.COMPLETED ||
      event.status === AgendaEventStatus.CANCELED
    ) {
      throw new BadRequestException(`Event with status ${event.status} cannot be rescheduled`);
    }

    // Get artist ID for validation
    const artistId = event.agenda.artistId;

    // Validate that the new time slot is available
    const duration = Math.ceil(
      (dto.newEndDate.getTime() - dto.newStartDate.getTime()) / (1000 * 60)
    );

    const validationResult = await this.schedulingService.validateAppointmentTime(
      artistId,
      dto.newStartDate,
      duration,
    );

    if (!validationResult.valid) {
      throw new BadRequestException(`Cannot reschedule to this time: ${validationResult.reason}`);
    }

    // Use a transaction to update the event and add to history
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update event dates and status
      await queryRunner.manager.update(
        'agenda_event',
        { id: eventId },
        {
          startDate: dto.newStartDate,
          endDate: dto.newEndDate,
          rescheduleReason: dto.reason,
          status: AgendaEventStatus.RESCHEDULED,
          lastStatusChange: new Date(),
          customerNotified: false,
        },
      );

      // Add to event history
      await queryRunner.manager.insert('agenda_event_history', {
        eventId,
        action: 'RESCHEDULE',
        details: dto.reason,
        performedBy: userId,
        performedAt: new Date(),
      });

      await queryRunner.commitTransaction();

      // Queue notification
      if (event.customerId) {
        await this.notificationQueue.add({
          jobId: 'EVENT_RESCHEDULED',
          metadata: {
            eventId,
            artistId,
            customerId: event.customerId,
            oldStartDate: event.startDate,
            newStartDate: dto.newStartDate,
            reason: dto.reason,
          },
        });
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Error rescheduling event: ${(error as any).message}`, (error as any) .stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}