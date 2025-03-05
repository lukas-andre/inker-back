import {
  Column,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';

import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';
import { MultimediasMetadataInterface } from '../../../multimedias/interfaces/multimediasMetadata.interface';
import { AgendaEventStatus } from '../../domain/enum/agendaEventStatus.enum';

import { Agenda } from './agenda.entity';
import { AgendaEventHistory } from './agendaEventHistory.entity';
import { AgendaInvitation } from './agendaInvitation.entity';

@Entity()
@Index(['startDate', 'endDate'])
@Index('idx_agenda_id', ['agenda'])
export class AgendaEvent extends BaseEntity {
  @ManyToOne(() => Agenda, agenda => agenda.agendaEvent)
  @JoinColumn({ name: 'agenda_id' })
  agenda: Agenda;

  @Index()
  @Column({ name: 'customer_id', nullable: true })
  customerId: number;

  @Column()
  title: string;

  @Index()
  @Column({ name: 'start_date' })
  startDate: Date;

  @Index()
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
    default: AgendaEventStatus.SCHEDULED,
  })
  status: AgendaEventStatus;

  @Column('jsonb', { nullable: true, name: 'work_evidence' })
  workEvidence: MultimediasMetadataInterface;

  @OneToOne(() => AgendaInvitation, agendaInvitation => agendaInvitation.event)
  agendaInvitation: AgendaInvitation;

  @Column({ name: 'cancelation_reason', nullable: true })
  cancelationReason: string;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @OneToMany(() => AgendaEventHistory, history => history.event)
  history: AgendaEventHistory[];

  @Index()
  @Column({ name: 'quotation_id', nullable: true })
  quotationId: number;
}
