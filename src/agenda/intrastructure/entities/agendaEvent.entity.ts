import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';
import { Agenda } from './agenda.entity';

@Entity()
export class AgendaEvent extends BaseEntity {
  @ManyToOne(
    () => Agenda,
    agenda => agenda.agendaEvent,
  )
  @JoinColumn({ name: 'agenda_id' })
  agenda: Agenda;

  @Column()
  title: string;

  @Column()
  start: Date;

  @Column()
  end: Date;

  @Column()
  color: string;

  @Column()
  info: string;

  @Column({ default: false })
  notification: boolean;

  // TODO: HACER RELACION OneToOne A UNA ENTIDAD customer que tenga su informacion basica;
}
