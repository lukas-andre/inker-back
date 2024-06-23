import { Column, Entity, Index, OneToMany } from 'typeorm';

import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';
import { MultimediasMetadataInterface } from '../../../multimedias/interfaces/multimediasMetadata.interface';

import { QuotationHistory } from './quotationHistory.entity';

export type QuotationStatus =
  | 'pending'
  | 'quoted'
  | 'accepted'
  | 'rejected'
  | 'appealed'
  | 'canceled';

export type AppealedReason = 'dateChange';

export type CancelReason = 'customer' | 'artist' | 'not_attended';

@Entity()
export class Quotation extends BaseEntity {
  @Index()
  @Column({ name: 'customer_id' })
  customerId: number;

  @Index()
  @Column({ name: 'artist_id' })
  artistId: number;

  @Column()
  description: string;

  @Column({ name: 'reference_images', type: 'jsonb', nullable: true })
  referenceImages?: MultimediasMetadataInterface;

  @Column({ name: 'proposed_designs', type: 'jsonb', nullable: true })
  proposedDesigns?: MultimediasMetadataInterface;

  @Column({
    name: 'status',
    enum: [
      'pending',
      'accepted',
      'rejected',
      'appealed',
      'canceled',
      'quotaed',
    ],
    enumName: 'quotation_status',
  })
  status: QuotationStatus;

  @Column({ name: 'estimated_cost', nullable: true })
  estimatedCost?: number;

  @Column({ name: 'response_date', nullable: true })
  responseDate?: Date;

  @Column({ name: 'appointment_date', nullable: true })
  appointmentDate?: Date;

  @Column({ name: 'appointment_duration', nullable: true })
  appointmentDuration?: number;

  @Column({ name: 'rejected_reason', nullable: true })
  rejectedReason?: string;

  @Column({
    name: 'appealed_reason',
    nullable: true,
    enum: ['dateChange'],
    enumName: 'quotation_appealed_reason',
  })
  appealedReason?: AppealedReason;

  @Column({ name: 'appealed_date', nullable: true })
  appealedDate?: Date;

  @Column({
    name: 'canceled_reason',
    nullable: true,
    enum: ['customer', 'artist', 'not_attended'],
  })
  canceledReason?: CancelReason;

  @Column({ name: 'canceled_date', nullable: true })
  canceledDate?: Date;

  @OneToMany(() => QuotationHistory, history => history.quotation)
  history?: QuotationHistory[];
}
