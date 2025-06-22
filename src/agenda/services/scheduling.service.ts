import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Between, In, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';

import { AgendaEventStatus } from '../domain/enum/agendaEventStatus.enum';
import { AgendaRepository } from '../infrastructure/repositories/agenda.repository';
import { AgendaEventRepository } from '../infrastructure/repositories/agendaEvent.repository';
import { AgendaUnavailableTimeRepository } from '../infrastructure/repositories/agendaUnavailableTime.provider';

export interface TimeSlot {
  startTime: Date;
  endTime: Date;
  density?: number; // Lower density is better (fewer nearby appointments)
}

export interface AvailabilityCalendar {
  date: string; // ISO date string (YYYY-MM-DD)
  slots: TimeSlot[];
}

@Injectable()
export class SchedulingService {
  private readonly logger = new Logger(SchedulingService.name);
  private readonly SLOT_INTERVAL_MINUTES = 30; // Default slot interval in minutes

  constructor(
    private readonly agendaProvider: AgendaRepository,
    private readonly agendaEventProvider: AgendaEventRepository,
    private readonly unavailableTimeProvider: AgendaUnavailableTimeRepository,
  ) {}

  /**
   * Find available time slots for an artist based on their working hours,
   * existing appointments, and unavailable time blocks
   */
  async findAvailableSlots(
    artistId: string,
    durationMinutes: number,
    startDate: Date,
    endDate: Date,
  ): Promise<AvailabilityCalendar[]> {
    this.logger.log(`Finding available slots for artist ${artistId}`);

    // Get the artist's agenda
    const agenda = await this.agendaProvider.findOne({
      where: { artistId },
    });
    if (!agenda) {
      throw new NotFoundException(
        `Artist with ID ${artistId} not found or has no agenda`,
      );
    }

    // If working hours are not set, cannot calculate availability
    if (!agenda.workingHoursStart || !agenda.workingHoursEnd) {
      agenda.workingHoursStart = '09:00';
      agenda.workingHoursEnd = '17:00';
      // throw new NotFoundException(
      //   `Artist with ID ${artistId} has not set working hours`,
      // );
    }

    // Parse working hours
    const [startHour, startMinute] = agenda.workingHoursStart
      .split(':')
      .map(n => parseInt(n, 10));
    const [endHour, endMinute] = agenda.workingHoursEnd
      .split(':')
      .map(n => parseInt(n, 10));

    // Get all existing appointments for the date range
    const existingAppointments = await this.agendaEventProvider.find({
      where: {
        agenda: { id: agenda.id },
        startDate: MoreThanOrEqual(startDate),
        endDate: LessThanOrEqual(endDate),
        status: In([
          AgendaEventStatus.CONFIRMED,
          AgendaEventStatus.RESCHEDULED,
        ]),
      },
    });

    // Get all unavailable time blocks
    const unavailableTimes = await this.unavailableTimeProvider.findByDateRange(
      agenda.id,
      startDate,
      endDate,
    );

    // Calculate available slots for each day
    const availabilityCalendar: AvailabilityCalendar[] = [];
    const currentDate = new Date(startDate);
    const endDateObj = new Date(endDate);

    while (currentDate <= endDateObj) {
      // Check if today is a working day (using UTC day)
      const dayOfWeek = (
        currentDate.getUTCDay() === 0 ? 7 : currentDate.getUTCDay()
      ).toString();
      if (!agenda.workingDays.includes(dayOfWeek)) {
        // Skip non-working days
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
        continue;
      }

      // Create slots for the day
      const daySlots = await this.generateDaySlots(
        currentDate,
        startHour,
        startMinute,
        endHour,
        endMinute,
        durationMinutes,
        existingAppointments,
        unavailableTimes,
      );

      if (daySlots.length > 0) {
        // Add to the calendar
        // Format date in UTC to ensure consistency
        const year = currentDate.getUTCFullYear();
        const month = String(currentDate.getUTCMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getUTCDate()).padStart(2, '0');
        availabilityCalendar.push({
          date: `${year}-${month}-${day}`,
          slots: daySlots,
        });
      }

      // Move to next day
      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    return availabilityCalendar;
  }

  /**
   * Suggest best appointment times based on schedule density
   * Prioritizes times in the near future and with better spacing
   */
  async suggestOptimalTimes(
    artistId: string,
    durationMinutes: number,
    numberOfSuggestions = 8,
  ): Promise<TimeSlot[]> {
    // Look ahead 14 days for suggested times
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 14);

    this.logger.log(
      `Looking for optimal slots from ${startDate.toISOString()} to ${endDate.toISOString()}`,
    );

    // Get available slots in the date range
    const allAvailability = await this.findAvailableSlots(
      artistId,
      durationMinutes,
      startDate,
      endDate,
    );

    // Flatten all slots and calculate density score
    let allSlots: TimeSlot[] = [];
    for (const day of allAvailability) {
      this.logger.log(`Processing slots for day ${day.date}`);
      const slotsWithDensity = await this.calculateDensityScores(
        artistId,
        day.slots,
      );
      allSlots = [...allSlots, ...slotsWithDensity];
    }

    // If we don't have enough slots, extend the search
    if (allSlots.length < numberOfSuggestions) {
      this.logger.log(
        `Not enough slots found (${allSlots.length}), extending search range`,
      );

      // Extend to 30 days
      endDate.setDate(startDate.getDate() + 30);

      const extendedAvailability = await this.findAvailableSlots(
        artistId,
        durationMinutes,
        startDate,
        endDate,
      );

      // Add more slots from extended range
      for (const day of extendedAvailability) {
        // Skip days we already processed
        if (allAvailability.some(a => a.date === day.date)) {
          continue;
        }

        const additionalSlots = await this.calculateDensityScores(
          artistId,
          day.slots,
        );
        allSlots = [...allSlots, ...additionalSlots];
      }
    }

    // Calculate proximity bonus - favor slots in the next 3 days
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    allSlots = allSlots.map(slot => {
      const slotDate = new Date(slot.startTime);

      // Apply a proximity bonus to slots in the next 3 days
      if (slotDate < threeDaysFromNow) {
        // Reduce density (lower is better) for near-term slots
        const daysDiff = Math.round(
          (slotDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
        );
        const proximityBonus = 0.5 * (3 - daysDiff); // 0.5-1.5 bonus for closer days
        return {
          ...slot,
          density: (slot.density || 0) - proximityBonus,
        };
      }
      return slot;
    });

    // Sort by improved density score (ascending - lower is better)
    allSlots.sort((a, b) => (a.density || 0) - (b.density || 0));

    // Ensure some diversity in days
    const result: TimeSlot[] = [];
    const selectedDates = new Set<string>();

    // First pass: take top 3 slots regardless of day
    const topSlots = allSlots.slice(0, 3);
    for (const slot of topSlots) {
      result.push(slot);
      const dateStr = new Date(slot.startTime).toDateString();
      selectedDates.add(dateStr);
    }

    // Second pass: add slots from different days to ensure variety
    for (const slot of allSlots) {
      if (result.length >= numberOfSuggestions) break;

      const dateStr = new Date(slot.startTime).toDateString();
      if (!selectedDates.has(dateStr)) {
        result.push(slot);
        selectedDates.add(dateStr);
      }
    }

    // Third pass: fill remaining slots with best options
    for (const slot of allSlots) {
      if (result.length >= numberOfSuggestions) break;

      // Skip slots we've already added
      if (!result.includes(slot)) {
        result.push(slot);
      }
    }

    this.logger.log(`Returning ${result.length} optimal time slots`);
    return result;
  }

  /**
   * Validate if a proposed appointment time works with the artist's schedule
   */
  async validateAppointmentTime(
    artistId: string,
    startTime: Date,
    durationMinutes: number,
  ): Promise<{ valid: boolean; reason?: string }> {
    this.logger.log(`Validating appointment time for artist ${artistId}`);

    const endTime = new Date(startTime);
    endTime.setUTCMinutes(endTime.getUTCMinutes() + durationMinutes);

    // Get the artist's agenda
    const agenda = await this.agendaProvider.findOne({
      where: { artistId },
    });
    if (!agenda) {
      return { valid: false, reason: 'Artist not found or has no agenda' };
    }

    // If working hours are not set, cannot validate
    if (!agenda.workingHoursStart || !agenda.workingHoursEnd) {
      // return { valid: false, reason: 'Artist has not set working hours' };
      agenda.workingHoursStart = '09:00';
      agenda.workingHoursEnd = '17:00';
    }

    // Check if the day is a working day (using UTC)
    const dayOfWeek = (
      startTime.getUTCDay() === 0 ? 7 : startTime.getUTCDay()
    ).toString();
    if (!agenda.workingDays.includes(dayOfWeek)) {
      return {
        valid: false,
        reason: 'The selected day is not a working day for this artist',
      };
    }

    // Parse working hours
    const [startHour, startMinute] = agenda.workingHoursStart
      .split(':')
      .map(n => parseInt(n, 10));
    const [endHour, endMinute] = agenda.workingHoursEnd
      .split(':')
      .map(n => parseInt(n, 10));

    // Check if appointment is within working hours (using UTC)
    const dayStart = new Date(startTime);
    dayStart.setUTCHours(startHour, startMinute, 0, 0);

    const dayEnd = new Date(startTime);
    dayEnd.setUTCHours(endHour, endMinute, 0, 0);

    if (startTime < dayStart) {
      return {
        valid: false,
        reason: 'Appointment starts before working hours',
      };
    }

    if (endTime > dayEnd) {
      return { valid: false, reason: 'Appointment ends after working hours' };
    }

    // Check for conflicts with existing appointments
    const existingAppointments = await this.agendaEventProvider.find({
      where: {
        agenda: { id: agenda.id },
        startDate: Between(startTime, endTime),
        status: In([
          AgendaEventStatus.CONFIRMED,
          AgendaEventStatus.RESCHEDULED,
        ]),
      },
    });

    if (existingAppointments.length > 0) {
      return {
        valid: false,
        reason: 'Time slot conflicts with an existing appointment',
      };
    }

    // Check for conflicts with unavailable time blocks
    const unavailableTimes = await this.unavailableTimeProvider.findOverlapping(
      agenda.id,
      startTime,
      endTime,
    );

    if (unavailableTimes.length > 0) {
      return {
        valid: false,
        reason: 'Time slot conflicts with artist unavailable time',
      };
    }

    return { valid: true };
  }

  /**
   * Generate available time slots for a day
   */
  private async generateDaySlots(
    date: Date,
    startHour: number,
    startMinute: number,
    endHour: number,
    endMinute: number,
    durationMinutes: number,
    existingAppointments: any[],
    unavailableTimes: any[],
  ): Promise<TimeSlot[]> {
    const slots: TimeSlot[] = [];
    // Create date at midnight UTC for the given day
    const baseDate = new Date(date);
    baseDate.setUTCHours(0, 0, 0, 0);
    
    // Create start and end times in UTC
    const dayStart = new Date(baseDate);
    dayStart.setUTCHours(startHour, startMinute, 0, 0);

    const dayEnd = new Date(baseDate);
    dayEnd.setUTCHours(endHour, endMinute, 0, 0);

    // If we're checking for today, use current time as start
    if (this.isToday(date)) {
      const now = new Date();
      if (now > dayStart) {
        dayStart.setTime(now.getTime());
        // Round up to next interval
        const minutesToAdd =
          this.SLOT_INTERVAL_MINUTES -
          (dayStart.getUTCMinutes() % this.SLOT_INTERVAL_MINUTES);
        dayStart.setUTCMinutes(dayStart.getUTCMinutes() + minutesToAdd);
      }
    }

    // Generate slots at regular intervals (e.g., every 30 minutes)
    const slotStart = new Date(dayStart);
    while (true) {
      const slotEnd = new Date(slotStart);
      slotEnd.setUTCMinutes(slotEnd.getUTCMinutes() + durationMinutes);

      // Stop if this slot would extend past the end of the working day
      // Allow slots that end exactly at closing time
      if (slotEnd.getTime() > dayEnd.getTime()) {
        break;
      }

      // Check if this slot conflicts with any existing appointments
      const hasConflict = existingAppointments.some(appt => {
        const apptStart = new Date(appt.startDate);
        const apptEnd = new Date(appt.endDate);
        return (
          (slotStart >= apptStart && slotStart < apptEnd) ||
          (slotEnd > apptStart && slotEnd <= apptEnd) ||
          (slotStart <= apptStart && slotEnd >= apptEnd)
        );
      });

      // Check if this slot conflicts with any unavailable time blocks
      const isUnavailable = unavailableTimes.some(block => {
        const blockStart = new Date(block.startDate);
        const blockEnd = new Date(block.endDate);
        return (
          (slotStart >= blockStart && slotStart < blockEnd) ||
          (slotEnd > blockStart && slotEnd <= blockEnd) ||
          (slotStart <= blockStart && slotEnd >= blockEnd)
        );
      });

      // If no conflicts, add to available slots
      if (!hasConflict && !isUnavailable) {
        slots.push({
          startTime: new Date(slotStart),
          endTime: new Date(slotEnd),
        });
      }

      // Move to next slot
      slotStart.setUTCMinutes(slotStart.getUTCMinutes() + this.SLOT_INTERVAL_MINUTES);
    }

    return slots;
  }

  /**
   * Calculate density scores for time slots
   * Lower scores are better (less crowded schedule)
   */
  private async calculateDensityScores(
    artistId: string,
    slots: TimeSlot[],
  ): Promise<TimeSlot[]> {
    // For each slot, check how many other appointments are nearby (within 3 hours)
    const slotsWithDensity = await Promise.all(
      slots.map(async slot => {
        const windowStart = new Date(slot.startTime);
        windowStart.setUTCHours(windowStart.getUTCHours() - 3);

        const windowEnd = new Date(slot.endTime);
        windowEnd.setUTCHours(windowEnd.getUTCHours() + 3);

        // Find appointments in the window
        const agenda = await this.agendaProvider.findOne({
          where: { artistId },
        });
        const nearbyAppointments = await this.agendaEventProvider.find({
          where: {
            agenda: { id: agenda.id },
            startDate: Between(windowStart, windowEnd),
            status: In([
              AgendaEventStatus.CONFIRMED,
              AgendaEventStatus.RESCHEDULED,
            ]),
          },
        });

        // Calculate density score based on number of nearby appointments
        // and how close they are to this slot
        let densityScore = 0;
        for (const appt of nearbyAppointments) {
          const apptStart = new Date(appt.startDate);
          const hoursDifference = Math.abs(
            (slot.startTime.getTime() - apptStart.getTime()) / (1000 * 60 * 60),
          );

          // Appointments closer to the slot have higher weight
          const weight = 1 - hoursDifference / 3; // Will be between 0 and 1
          densityScore += weight;
        }

        return {
          ...slot,
          density: densityScore,
        };
      }),
    );

    return slotsWithDensity;
  }

  private isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getUTCDate() === today.getUTCDate() &&
      date.getUTCMonth() === today.getUTCMonth() &&
      date.getUTCFullYear() === today.getUTCFullYear()
    );
  }
}
