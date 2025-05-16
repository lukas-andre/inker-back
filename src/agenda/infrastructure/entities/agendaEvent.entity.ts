import {
  Column,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';

import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';
import { MultimediasMetadataInterface } from '../../../multimedias/interfaces/multimediasMetadata.interface';
import { AgendaEventStatus } from '../../domain/enum/agendaEventStatus.enum';

import { Agenda } from './agenda.entity';
import { AgendaInvitation } from './agendaInvitation.entity';

// Assuming UserType can be imported or is defined globally/similarly to EventActionEngineService
// If not, we might need: export type UserType = 'artist' | 'customer' | 'system';
// For now, let's assume it will be resolved or defined in a shared types file.
// For the purpose of this edit, I'll define it locally if not found, but ideally it's shared.
import { UserType as EngineUserType } from '../../domain/services/eventActionEngine.service'; // Attempt to import
export type UserType = EngineUserType | 'system'; // Extend UserType to include 'system'

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
    default: AgendaEventStatus.SCHEDULED,
  })
  status: AgendaEventStatus;

  @Column('jsonb', { nullable: true, name: 'work_evidence' })
  workEvidence: MultimediasMetadataInterface;

  @OneToOne(() => AgendaInvitation, agendaInvitation => agendaInvitation.event)
  agendaInvitation: AgendaInvitation;

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
}