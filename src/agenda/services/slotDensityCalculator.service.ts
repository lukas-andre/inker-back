import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { In, Between } from 'typeorm';
import { AgendaEventStatus } from '../domain/enum/agendaEventStatus.enum';
import { AgendaRepository } from '../infrastructure/repositories/agenda.repository';
import { AgendaEventRepository } from '../infrastructure/repositories/agendaEvent.repository';
import { AgendaSlotDensityRepository } from '../infrastructure/repositories/agendaSlotDensity.repository';
import { AgendaSlotDensity } from '../infrastructure/entities/agendaSlotDensity.entity';
import { SchedulerCacheService } from './schedulerCache.service';

@Injectable()
export class SlotDensityCalculatorService {
  private readonly logger = new Logger(SlotDensityCalculatorService.name);
  private readonly SLOT_DURATION_MINUTES = 30;
  private readonly PROXIMITY_WINDOW_HOURS = 2;
  private readonly BATCH_SIZE = 100;

  constructor(
    private readonly agendaRepository: AgendaRepository,
    private readonly agendaEventRepository: AgendaEventRepository,
    private readonly slotDensityRepository: AgendaSlotDensityRepository,
    private readonly cacheService: SchedulerCacheService,
  ) {}

  /**
   * Calculate density for a specific artist's agenda for a date range
   */
  async calculateDensityForArtist(
    artistId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<void> {
    this.logger.log(`Calculating density for artist ${artistId} from ${startDate} to ${endDate}`);

    const agenda = await this.agendaRepository.findOne({
      where: { artistId },
    });

    if (!agenda) {
      this.logger.warn(`No agenda found for artist ${artistId}`);
      return;
    }

    // Get all events in the extended date range (including proximity window)
    const extendedStartDate = new Date(startDate);
    extendedStartDate.setHours(extendedStartDate.getHours() - this.PROXIMITY_WINDOW_HOURS);
    
    const extendedEndDate = new Date(endDate);
    extendedEndDate.setHours(extendedEndDate.getHours() + this.PROXIMITY_WINDOW_HOURS);

    const events = await this.agendaEventRepository.find({
      where: {
        agenda: { id: agenda.id },
        startDate: Between(extendedStartDate, extendedEndDate),
        status: In([
          AgendaEventStatus.CONFIRMED,
          AgendaEventStatus.IN_PROGRESS,
          AgendaEventStatus.PAYMENT_PENDING,
          AgendaEventStatus.RESCHEDULED,
        ]),
      },
      order: {
        startDate: 'ASC',
      },
    });

    // Process each day in the range
    const currentDate = new Date(startDate);
    const densityBatch: Partial<AgendaSlotDensity>[] = [];

    while (currentDate <= endDate) {
      const daySlots = await this.calculateDayDensity(
        agenda.id,
        currentDate,
        events,
        agenda.workingHoursStart || '09:00',
        agenda.workingHoursEnd || '18:00',
      );

      densityBatch.push(...daySlots);

      // Batch insert when we reach the batch size
      if (densityBatch.length >= this.BATCH_SIZE) {
        await this.slotDensityRepository.batchUpsert(densityBatch);
        densityBatch.length = 0; // Clear the batch
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Insert remaining slots
    if (densityBatch.length > 0) {
      await this.slotDensityRepository.batchUpsert(densityBatch);
    }

    // Invalidate cache for this artist
    await this.cacheService.invalidateDensityCache(artistId);

    this.logger.log(`Density calculation completed for artist ${artistId}`);
  }

  private async calculateDayDensity(
    agendaId: string,
    date: Date,
    allEvents: any[],
    workingHoursStart: string,
    workingHoursEnd: string,
  ): Promise<Partial<AgendaSlotDensity>[]> {
    const slots: Partial<AgendaSlotDensity>[] = [];
    const [startHour, startMinute] = workingHoursStart.split(':').map(Number);
    const [endHour, endMinute] = workingHoursEnd.split(':').map(Number);

    // Generate slots for the working hours
    const slotStartTime = new Date(date);
    slotStartTime.setHours(startHour, startMinute, 0, 0);

    const slotEndTime = new Date(date);
    slotEndTime.setHours(endHour, endMinute, 0, 0);

    const currentSlot = new Date(slotStartTime);

    while (currentSlot < slotEndTime) {
      const slotEnd = new Date(currentSlot);
      slotEnd.setMinutes(slotEnd.getMinutes() + this.SLOT_DURATION_MINUTES);

      // Calculate metrics for this slot
      const { nearbyEvents, conflictingEvents } = this.calculateSlotMetrics(
        currentSlot,
        slotEnd,
        allEvents,
      );

      // Calculate time-based factors
      const timeOfDayFactor = this.getTimeOfDayFactor(currentSlot.getHours());
      const dayOfWeekFactor = this.getDayOfWeekFactor(currentSlot.getDay());

      // Calculate density score using static method
      const densityScore = AgendaSlotDensity.calculateDensityScore(
        nearbyEvents,
        conflictingEvents,
        timeOfDayFactor,
        dayOfWeekFactor,
      );

      slots.push({
        agendaId,
        slotDate: new Date(date.toISOString().split('T')[0]),
        slotTime: `${currentSlot.getHours().toString().padStart(2, '0')}:${currentSlot.getMinutes().toString().padStart(2, '0')}`,
        densityScore,
        nearbyEventsCount: nearbyEvents,
        conflictingEventsCount: conflictingEvents,
        isUnavailable: conflictingEvents > 0,
        metadata: {
          lastCalculated: new Date(),
          factors: {
            timeOfDay: timeOfDayFactor,
            dayOfWeek: dayOfWeekFactor,
            proximity: nearbyEvents,
            conflicts: conflictingEvents,
          },
        },
      });

      currentSlot.setMinutes(currentSlot.getMinutes() + this.SLOT_DURATION_MINUTES);
    }

    return slots;
  }

  private calculateSlotMetrics(
    slotStart: Date,
    slotEnd: Date,
    events: any[],
  ): { nearbyEvents: number; conflictingEvents: number } {
    let nearbyEvents = 0;
    let conflictingEvents = 0;

    const proximityStart = new Date(slotStart);
    proximityStart.setHours(proximityStart.getHours() - this.PROXIMITY_WINDOW_HOURS);
    
    const proximityEnd = new Date(slotEnd);
    proximityEnd.setHours(proximityEnd.getHours() + this.PROXIMITY_WINDOW_HOURS);

    for (const event of events) {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);

      // Check for direct conflict
      if (this.hasTimeOverlap(slotStart, slotEnd, eventStart, eventEnd)) {
        conflictingEvents++;
      }
      // Check for proximity
      else if (this.hasTimeOverlap(proximityStart, proximityEnd, eventStart, eventEnd)) {
        nearbyEvents++;
      }
    }

    return { nearbyEvents, conflictingEvents };
  }

  private hasTimeOverlap(
    start1: Date,
    end1: Date,
    start2: Date,
    end2: Date,
  ): boolean {
    return start1 < end2 && start2 < end1;
  }

  private getTimeOfDayFactor(hour: number): number {
    // Peak hours get higher factors
    if (hour >= 10 && hour <= 14) return 0.8; // Lunch hours
    if (hour >= 17 && hour <= 19) return 0.9; // After work hours
    if (hour >= 9 && hour <= 11) return 0.6; // Morning
    if (hour >= 15 && hour <= 17) return 0.7; // Afternoon
    return 0.3; // Early morning or late evening
  }

  private getDayOfWeekFactor(dayOfWeek: number): number {
    // 0 = Sunday, 6 = Saturday
    if (dayOfWeek === 0 || dayOfWeek === 6) return 0.9; // Weekends
    if (dayOfWeek === 5) return 0.8; // Friday
    if (dayOfWeek === 1) return 0.5; // Monday
    return 0.6; // Tuesday-Thursday
  }

  /**
   * Scheduled job to update density calculations
   * Runs every night at 2 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async updateAllArtistsDensity(): Promise<void> {
    this.logger.log('Starting scheduled density update for all artists');

    try {
      const agendas = await this.agendaRepository.find({});
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30); // Calculate 30 days ahead

      for (const agenda of agendas) {
        await this.calculateDensityForArtist(
          agenda.artistId,
          startDate,
          endDate,
        );
      }

      // Cleanup old density data
      const deletedCount = await this.slotDensityRepository.cleanupOldDensities(90);
      this.logger.log(`Cleaned up ${deletedCount} old density records`);

    } catch (error) {
      this.logger.error('Failed to update density calculations', error);
    }
  }

  /**
   * Real-time density update when an event is created/updated
   */
  async updateDensityForEvent(
    agendaId: string,
    eventDate: Date,
  ): Promise<void> {
    const startDate = new Date(eventDate);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(eventDate);
    endDate.setHours(23, 59, 59, 999);

    const agenda = await this.agendaRepository.findOne({
      where: { id: agendaId },
    });

    if (agenda) {
      await this.calculateDensityForArtist(
        agenda.artistId,
        startDate,
        endDate,
      );
    }
  }
}