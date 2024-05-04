import {
  Column,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';

import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';
import { MultimediasMetadataInterface } from '../../../multimedias/interfaces/multimediasMetadata.interface';

import { Agenda } from './agenda.entity';
import { AgendaInvitation } from './agendaInvitation.entity';

@Entity()
@Index(['start', 'end'])
export class AgendaEvent extends BaseEntity {
  @ManyToOne(() => Agenda, agenda => agenda.agendaEvent)
  @JoinColumn({ name: 'agenda_id' })
  agenda: Agenda;

  @Column({ name: 'customer_id', nullable: true })
  customerId: number;

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

  @Column({ default: false })
  done: boolean;

  @Column('jsonb', { nullable: true, name: 'work_evidence' })
  workEvidence: MultimediasMetadataInterface;

  @OneToOne(() => AgendaInvitation, agendaInvitation => agendaInvitation.event)
  agendaInvitation: AgendaInvitation;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
  // TODO: HACER RELACION OneToOne A UNA ENTIDAD customer que tenga su informacion basica;
}
