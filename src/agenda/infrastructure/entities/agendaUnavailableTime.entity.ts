import {
  Column,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';
import { Agenda } from './agenda.entity';

@Entity()
@Index(['startDate', 'endDate'])
export class AgendaUnavailableTime extends BaseEntity {
  @ManyToOne(() => Agenda, agenda => agenda.unavailableTimes)
  @JoinColumn({ name: 'agenda_id' })
  agenda: Agenda;

  @Column({ name: 'agenda_id' })
  agendaId: string;

  @Index()
  @Column({ name: 'start_date' })
  startDate: Date;

  @Index()
  @Column({ name: 'end_date' })
  endDate: Date;

  @Column({ nullable: true })
  reason: string;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}