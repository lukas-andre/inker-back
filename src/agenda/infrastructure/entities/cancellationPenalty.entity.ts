import { Column, Entity, Index } from 'typeorm';

import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';
import { UserType } from '../../../users/domain/enums/userType.enum';
import { PenaltyStatus, PenaltyType } from '../../domain/enum';

export type PenaltyUserRole = UserType.ARTIST | UserType.CUSTOMER;

export interface CancellationPenaltyMetadata {
  cancellationTime: Date;
  originalEventStart: Date;
  userRole: PenaltyUserRole;
  appliedAt?: Date; // Optional, as it might not be set if pending/waived
  reason?: string; // Optional: reason for cancellation or waiving
  waivedBy?: string; // Optional: user ID who waived the penalty
  cancellationInitiatorId: string; // User ID of who initiated the cancellation (could be same as userId or an admin)
}

@Entity()
export class CancellationPenalty extends BaseEntity {
  @Index()
  @Column({ name: 'event_id', type: 'uuid' })
  eventId: string;

  @Index() // Added index as it will be queried often
  @Column({ name: 'user_id', type: 'uuid' }) // User who incurred the penalty
  userId: string;

  @Column({
    type: 'enum',
    enum: PenaltyType,
  })
  type: PenaltyType;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true }) // Nullable if reputation points
  amount: number | null;

  @Column({ type: 'integer', nullable: true }) // For REPUTATION_POINTS type
  reputationPoints: number | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: CancellationPenaltyMetadata;

  @Column({
    type: 'enum',
    enum: PenaltyStatus,
    default: PenaltyStatus.PENDING,
  })
  status: PenaltyStatus;

  @Index()
  @Column({ name: 'agenda_id', type: 'uuid', nullable: true })
  agendaId: string | null; // Storing agendaId for easier artist/customer grouping if needed

  @Index()
  @Column({ name: 'quotation_id', type: 'uuid', nullable: true })
  quotationId: string | null;
}
