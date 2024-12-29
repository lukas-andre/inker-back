import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { AgendaEvent } from './agendaEvent.entity';

@Entity()
export class AgendaEventHistory {
  @PrimaryGeneratedColumn()
  id: number;

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

  @Column({ nullable: true })
  cancelationReason: string;

  @CreateDateColumn({ name: 'recorded_at' })
  recordedAt: Date;

  @Column({ name: 'updated_by' })
  updatedBy: number;
}
