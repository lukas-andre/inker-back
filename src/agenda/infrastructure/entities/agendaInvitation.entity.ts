import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';

import { AgendaEvent } from './agendaEvent.entity';

export const AgendaInvitationStatus = {
  pending: 'pending',
  accepted: 'accepted',
  rejected: 'rejected',
} as const;

export type AgendaInvitationStatusEnum =
  (typeof AgendaInvitationStatus)[keyof typeof AgendaInvitationStatus];

@Entity()
export class AgendaInvitation extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'invitee_id' })
  inviteeId: number;

  @Column({
    enum: ['pending', 'accepted', 'rejected'],
    enumName: 'agenda_invitation_status',
  })
  status: AgendaInvitationStatusEnum;

  @OneToOne(() => AgendaEvent, event => event.agendaInvitation)
  @JoinColumn({ name: 'event_id' })
  event: AgendaEvent;
}
