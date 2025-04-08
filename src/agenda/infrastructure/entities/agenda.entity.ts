import { Column, DeleteDateColumn, Entity, Index, OneToMany } from 'typeorm';

import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';

import { AgendaEvent } from './agendaEvent.entity';
import { AgendaUnavailableTime } from './agendaUnavailableTime.entity';

@Entity()
export class Agenda extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @Index()
  @Column({ name: 'artist_id', default: 0 })
  artistId: string;

  @Column({
    name: 'working_days',
    type: 'jsonb',
    default: ['1', '2', '3', '4', '5'],
  })
  workingDays: string[];

  @Column({ name: 'working_hours_start', type: 'time', nullable: true })
  workingHoursStart: string;

  @Column({ name: 'working_hours_end', type: 'time', nullable: true })
  workingHoursEnd: string;

  @Column({ default: false })
  public: boolean;

  @Column({ default: true })
  open: boolean;

  @OneToMany(() => AgendaEvent, agendaEvent => agendaEvent.agenda)
  agendaEvent: AgendaEvent[];

  @OneToMany(() => AgendaUnavailableTime, unavailableTime => unavailableTime.agenda)
  unavailableTimes: AgendaUnavailableTime[];

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}