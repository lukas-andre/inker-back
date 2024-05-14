import { A } from 'ts-toolbelt';
import { Column, DeleteDateColumn, Entity, Index, OneToMany } from 'typeorm';

import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';

import { AgendaEvent } from './agendaEvent.entity';
import { AgendaEventHistory } from './agendaEventHistory.entity';

@Entity()
export class Agenda extends BaseEntity {
  @Index()
  @Column({ name: 'user_id' })
  userId: number;

  @Index()
  @Column({ name: 'artist_id', default: 0 })
  artistId: number;

  @Column({
    name: 'working_days',
    type: 'jsonb',
    default: ['1', '2', '3', '4', '5'],
  })
  workingDays: string[];

  @Column({ default: false })
  public: boolean;

  @Column({ default: true })
  open: boolean;

  @OneToMany(() => AgendaEvent, agendaEvent => agendaEvent.agenda)
  agendaEvent: AgendaEvent[];

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
