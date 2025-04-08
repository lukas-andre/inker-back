import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';

import { AgendaEventStatus } from '../../domain/enum/agendaEventStatus.enum';
import { AgendaEvent } from './agendaEvent.entity';

@Entity()
export class AgendaEventHistory {
  @PrimaryColumn('uuid')
  id: string;

  @ManyToOne(() => AgendaEvent, event => event.history)
  @JoinColumn({ name: 'event_id' })
  event: AgendaEvent;

  @Column()
  title: string;

  @Column({ name: 'start_date' })
  startDate: Date;

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
    nullable: true
  })
  status: AgendaEventStatus;

  @Column({ name: 'cancelation_reason', nullable: true })
  cancelationReason: string;

  @CreateDateColumn({ name: 'recorded_at' })
  recordedAt: Date;

  @Column({ name: 'updated_by' })
  updatedBy: number;
}
