import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Agenda } from './agenda.entity';

@Entity('agenda_slot_density')
@Index('idx_slot_density_lookup', ['agendaId', 'slotDate', 'slotTime'])
@Index('idx_slot_density_date', ['slotDate'])
export class AgendaSlotDensity {
  @PrimaryColumn({ type: 'uuid' })
  agendaId: string;

  @PrimaryColumn({ type: 'date' })
  slotDate: Date;

  @PrimaryColumn({ type: 'time' })
  slotTime: string; // HH:mm format

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  densityScore: number;

  @Column({ type: 'int', default: 0 })
  nearbyEventsCount: number;

  @Column({ type: 'int', default: 0 })
  conflictingEventsCount: number;

  @Column({ type: 'boolean', default: false })
  isUnavailable: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    lastCalculated?: Date;
    factors?: {
      timeOfDay: number;
      dayOfWeek: number;
      proximity: number;
      conflicts: number;
    };
  };

  @UpdateDateColumn()
  updatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Agenda, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'agendaId' })
  agenda: Agenda;

  // Static helper method to calculate composite density score
  static calculateDensityScore(
    nearbyEvents: number,
    conflictingEvents: number,
    timeOfDayFactor: number = 1,
    dayOfWeekFactor: number = 1,
  ): number {
    // Base density from nearby events (0-10 scale)
    const proximityScore = Math.min(nearbyEvents * 2, 10);
    
    // Penalty for conflicts (0-5 scale)
    const conflictPenalty = Math.min(conflictingEvents * 2.5, 5);
    
    // Time of day factor (0-2 scale)
    // Peak hours (10am-2pm, 5pm-7pm) get higher scores
    const timeScore = timeOfDayFactor * 2;
    
    // Day of week factor (0-1.5 scale)
    // Weekends typically busier
    const dayScore = dayOfWeekFactor * 1.5;
    
    // Calculate final density (0-100 scale)
    const density = (proximityScore + conflictPenalty + timeScore + dayScore) * 5.26;
    
    return Math.round(density * 100) / 100; // Round to 2 decimal places
  }
}