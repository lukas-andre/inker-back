import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  DeleteDateColumn,
} from 'typeorm';
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

  @DeleteDateColumn()
  delete_at: Date;

  // TODO: HACER RELACION OneToOne A UNA ENTIDAD customer que tenga su informacion basica;
  // TODO: HACER RELACION OneToOne A UNA ENTIDAD address que la ubicacion del evento;
}
