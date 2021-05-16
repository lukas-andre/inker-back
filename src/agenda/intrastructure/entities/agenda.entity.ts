import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';
import { AgendaEvent } from './agendaEvent.entity';

@Entity()
export class Agenda extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: number;

  @Column({ default: false })
  public: boolean;

  @Column({ default: true })
  open: boolean;

  @OneToMany(() => AgendaEvent, agendaEvent => agendaEvent.agenda)
  agendaEvent: AgendaEvent;
}
