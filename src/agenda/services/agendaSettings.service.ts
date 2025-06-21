import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { CreateUnavailableTimeReqDto } from '../infrastructure/dtos/createUnavailableTimeReq.dto';
import { SetWorkingHoursReqDto } from '../infrastructure/dtos/setWorkingHoursReq.dto';
import { AgendaUnavailableTime } from '../infrastructure/entities/agendaUnavailableTime.entity';
import { AgendaRepository } from '../infrastructure/repositories/agenda.repository';
import { AgendaUnavailableTimeRepository } from '../infrastructure/repositories/agendaUnavailableTime.provider';

@Injectable()
export class AgendaSettingsService {
  private readonly logger = new Logger(AgendaSettingsService.name);

  constructor(
    private readonly agendaProvider: AgendaRepository,
    private readonly unavailableTimeProvider: AgendaUnavailableTimeRepository,
  ) {}

  /**
   * Set working hours and working days for an artist's agenda
   */
  async setWorkingHours(
    agendaId: string,
    dto: SetWorkingHoursReqDto,
  ): Promise<void> {
    this.logger.log(`Setting working hours for agenda ${agendaId}`);

    // Find the agenda
    const agenda = await this.agendaProvider.findOne({
      where: { id: agendaId },
    });
    if (!agenda) {
      throw new NotFoundException(`Agenda with ID ${agendaId} not found`);
    }

    // Validate that end time is after start time
    const startTime = this.parseTimeString(dto.workingHoursStart);
    const endTime = this.parseTimeString(dto.workingHoursEnd);

    if (endTime <= startTime) {
      throw new BadRequestException(
        'Working hours end time must be after start time',
      );
    }

    // Update the agenda
    await this.agendaProvider.update(agendaId, {
      workingHoursStart: dto.workingHoursStart,
      workingHoursEnd: dto.workingHoursEnd,
      workingDays: dto.workingDays,
    });
  }

  /**
   * Create a new unavailable time block
   */
  async createUnavailableTime(
    agendaId: string,
    dto: CreateUnavailableTimeReqDto,
  ): Promise<AgendaUnavailableTime> {
    this.logger.log(`Creating unavailable time for agenda ${agendaId}`);

    // Find the agenda
    const agenda = await this.agendaProvider.findOne({
      where: { id: agendaId },
    });
    if (!agenda) {
      throw new NotFoundException(`Agenda with ID ${agendaId} not found`);
    }

    // Validate that end date is after start date
    if (dto.endDate <= dto.startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    // Check for overlapping unavailable times
    const overlapping = await this.unavailableTimeProvider.findOverlapping(
      agendaId,
      dto.startDate,
      dto.endDate,
    );

    if (overlapping.length > 0) {
      throw new BadRequestException(
        'This time block overlaps with an existing unavailable time',
      );
    }

    // Create the unavailable time
    return this.unavailableTimeProvider.create({
      agendaId,
      startDate: dto.startDate,
      endDate: dto.endDate,
      reason: dto.reason,
    });
  }

  /**
   * Get all unavailable time blocks for an agenda
   */
  async getUnavailableTimes(
    agendaId: string,
  ): Promise<AgendaUnavailableTime[]> {
    this.logger.log(`Getting unavailable times for agenda ${agendaId}`);

    // Find the agenda
    const agenda = await this.agendaProvider.findOne({
      where: { id: agendaId },
    });
    if (!agenda) {
      throw new NotFoundException(`Agenda with ID ${agendaId} not found`);
    }

    return this.unavailableTimeProvider.findByAgendaId(agendaId);
  }

  /**
   * Delete an unavailable time block
   */
  async deleteUnavailableTime(agendaId: string, id: string): Promise<void> {
    this.logger.log(`Deleting unavailable time ${id} for agenda ${agendaId}`);

    // Find the unavailable time
    const unavailableTime = await this.unavailableTimeProvider.findOne(id);
    if (!unavailableTime) {
      throw new NotFoundException(`Unavailable time with ID ${id} not found`);
    }

    // Check that it belongs to the provided agenda
    if (unavailableTime.agendaId !== agendaId) {
      throw new BadRequestException(
        `Unavailable time ${id} does not belong to agenda ${agendaId}`,
      );
    }

    await this.unavailableTimeProvider.remove(id);
  }

  /**
   * Parse a time string in format HH:MM to minutes since midnight
   */
  private parseTimeString(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(n => parseInt(n, 10));
    return hours * 60 + minutes;
  }
}
