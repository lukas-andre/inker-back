import { Entity, Column, OneToMany, DeleteDateColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';
import { AgendaEvent } from './agendaEvent.entity';

@Entity()
export class Agenda extends BaseEntity {
  @Index()
  @Column({ name: 'user_id' })
  userId: number;

  @Column({ type: 'jsonb', default: ['1', '2', '3', '4', '5'] })
  workingDays: string[];

  @Column({ default: false })
  public: boolean;

  @Column({ default: true })
  open: boolean;

  @OneToMany(
    () => AgendaEvent,
    agendaEvent => agendaEvent.agenda,
  )
  agendaEvent: AgendaEvent;

  @DeleteDateColumn()
  delete_at: Date;
}
