import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { AGENDA_DB_CONNECTION_NAME } from '../../../databases/constants';
import { AgendaSlotDensity } from '../entities/agendaSlotDensity.entity';

@Injectable()
export class AgendaSlotDensityRepository {
  constructor(
    @InjectRepository(AgendaSlotDensity, AGENDA_DB_CONNECTION_NAME)
    private readonly repository: Repository<AgendaSlotDensity>,
  ) {}

  async findByAgendaAndDateRange(
    agendaId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<AgendaSlotDensity[]> {
    return this.repository.find({
      where: {
        agendaId,
        slotDate: Between(startDate, endDate),
      },
      order: {
        slotDate: 'ASC',
        slotTime: 'ASC',
      },
    });
  }

  async findLowDensitySlots(
    agendaId: string,
    startDate: Date,
    endDate: Date,
    maxDensity: number = 50,
    limit: number = 10,
  ): Promise<AgendaSlotDensity[]> {
    return this.repository.find({
      where: {
        agendaId,
        slotDate: Between(startDate, endDate),
        densityScore: LessThanOrEqual(maxDensity),
        isUnavailable: false,
      },
      order: {
        densityScore: 'ASC',
        slotDate: 'ASC',
        slotTime: 'ASC',
      },
      take: limit,
    });
  }

  async upsertSlotDensity(
    agendaId: string,
    slotDate: Date,
    slotTime: string,
    densityData: Partial<AgendaSlotDensity>,
  ): Promise<AgendaSlotDensity> {
    const existing = await this.repository.findOne({
      where: { agendaId, slotDate, slotTime },
    });

    if (existing) {
      await this.repository.update(
        { agendaId, slotDate, slotTime },
        {
          ...densityData,
          updatedAt: new Date(),
        },
      );
      return await this.repository.findOne({
        where: { agendaId, slotDate, slotTime },
      });
    }

    const newDensity = this.repository.create({
      agendaId,
      slotDate,
      slotTime,
      ...densityData,
    });

    return this.repository.save(newDensity);
  }

  async batchUpsert(densities: Partial<AgendaSlotDensity>[]): Promise<void> {
    // Use ON CONFLICT for efficient batch upsert
    const values = densities
      .map(
        d =>
          `('${d.agendaId}', '${d.slotDate}', '${d.slotTime}', ${d.densityScore}, ${d.nearbyEventsCount}, ${d.conflictingEventsCount}, ${d.isUnavailable}, '${JSON.stringify(d.metadata || {})}')`,
      )
      .join(',');

    await this.repository.query(`
      INSERT INTO agenda_slot_density (
        agenda_id, slot_date, slot_time, density_score, 
        nearby_events_count, conflicting_events_count, 
        is_unavailable, metadata
      ) VALUES ${values}
      ON CONFLICT (agenda_id, slot_date, slot_time)
      DO UPDATE SET
        density_score = EXCLUDED.density_score,
        nearby_events_count = EXCLUDED.nearby_events_count,
        conflicting_events_count = EXCLUDED.conflicting_events_count,
        is_unavailable = EXCLUDED.is_unavailable,
        metadata = EXCLUDED.metadata,
        updated_at = CURRENT_TIMESTAMP
    `);
  }

  async markSlotsAsUnavailable(
    agendaId: string,
    slotDate: Date,
    startTime: string,
    endTime: string,
  ): Promise<void> {
    await this.repository.update(
      {
        agendaId,
        slotDate,
        slotTime: Between(startTime, endTime),
      },
      {
        isUnavailable: true,
        updatedAt: new Date(),
      },
    );
  }

  async getAverageDensityByHour(
    agendaId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{ hour: number; avgDensity: number }[]> {
    const result = await this.repository.query(`
      SELECT 
        EXTRACT(HOUR FROM slot_time) as hour,
        AVG(density_score) as avg_density
      FROM agenda_slot_density
      WHERE agenda_id = $1
        AND slot_date BETWEEN $2 AND $3
        AND is_unavailable = false
      GROUP BY hour
      ORDER BY hour
    `, [agendaId, startDate, endDate]);

    return result.map(r => ({
      hour: parseInt(r.hour),
      avgDensity: parseFloat(r.avg_density),
    }));
  }

  async cleanupOldDensities(daysToKeep: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.repository.delete({
      slotDate: LessThanOrEqual(cutoffDate),
    });

    return result.affected || 0;
  }
}