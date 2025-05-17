import {
  Column,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';
import { MultimediasMetadataInterface } from '../../../multimedias/interfaces/multimediasMetadata.interface';
import { AgendaEventStatus } from '../../domain/enum/agendaEventStatus.enum';
import { AgendaEventTransition } from '../../domain/services/eventStateMachine.service';

import { Agenda } from './agenda.entity';
import { UserType } from '../../../users/domain/enums/userType.enum';

export interface IStatusLogEntry {
  status: AgendaEventStatus;
  timestamp: Date;
  actor: {
    userId: string;    // The global user ID from auth system (e.g., Keycloak ID)
    roleId: string;    // The ID specific to their role (e.g., artist_id, customer_id) or a relevant ID for system
    role: UserType;    // 'artist' | 'customer' | 'system'
  };
  reason?: string;
  notes?: string;
  action?: AgendaEventTransition;
}

// Define the interface for reschedule log entries
export interface IRescheduleLogEntry {
  timestamp: Date;
  actorId: string;          // The global user ID from auth system (e.g., Keycloak ID)
  actorRole: UserType;      // 'artist' | 'customer' | 'system'
  previousStartDate?: Date; // The start date before this specific reschedule
  previousEndDate?: Date;   // The end date before this specific reschedule
  newStartDate: Date;       // The new start date set by this reschedule
  newEndDate?: Date;      // The new end date set by this reschedule
  reason?: string;           // Reason for rescheduling, if provided
}

@Entity()
@Index(['startDate', 'endDate'])
@Index('idx_agenda_id', ['agenda'])
export class AgendaEvent extends BaseEntity {
  @ManyToOne(() => Agenda, agenda => agenda.agendaEvent)
  @JoinColumn({ name: 'agenda_id' })
  agenda: Agenda;

  @Index()
  @Column({ name: 'customer_id', nullable: true })
  customerId: string;

  @Column()
  title: string;

  @Index()
  @Column({ name: 'start_date' })
  startDate: Date;

  @Index()
  @Column({ name: 'end_date' })
  endDate: Date;

  @Column()
  color: string;

  @Column()
  info: string;

  @Column({ default: false })
  notification: boolean;

  @Column({ default: false })
  done: boolean;

  @Column({
    type: 'varchar',
    default: AgendaEventStatus.CREATED,
  })
  status: AgendaEventStatus;

  @Column('jsonb', { nullable: true, name: 'work_evidence' })
  workEvidence: MultimediasMetadataInterface;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'preparation_time', type: 'integer', nullable: true })
  preparationTime: number;

  @Column({ name: 'cleanup_time', type: 'integer', nullable: true })
  cleanupTime: number;

  @Column({ name: 'customer_notified', default: false })
  customerNotified: boolean;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @Column('jsonb', { name: 'status_log', nullable: true })
  statusLog: IStatusLogEntry[];

  @Index()
  @Column({ name: 'quotation_id', nullable: true })
  quotationId: string;

  @Column({ name: 'review_id', type: 'uuid', nullable: true })
  reviewId: string | null;

  // Property to store the history of reschedule attempts
  // The EventStateMachineService.ts relies on this field with the IRescheduleLogEntry structure.
  // The getOriginal('startDate') method used in EventStateMachineService.ts for previousStartDate/previousEndDate
  // is a placeholder. You'll need to implement a way to get the values before they are updated,
  // e.g., by fetching the entity fresh, passing original values in the state machine context payload,
  // or if your BaseEntity or a subscriber provides such functionality.
  @Column('jsonb', { name: 'reschedule_log', nullable: true })
  rescheduleLog: IRescheduleLogEntry[];
}