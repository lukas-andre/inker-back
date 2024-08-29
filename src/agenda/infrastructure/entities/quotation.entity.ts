import { Column, Entity, Index, OneToMany } from 'typeorm';

import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';
import { MultimediasMetadataInterface } from '../../../multimedias/interfaces/multimediasMetadata.interface';

import { QuotationHistory } from './quotationHistory.entity';

export const CUSTOMER_CANCEL_REASONS = [
  'change_of_mind',
  'found_another_artist',
  'financial_reasons',
  'personal_reasons',
  'other',
] as const;

export const CUSTOMER_REJECT_REASONS = [
  'too_expensive',
  'not_what_i_wanted',
  'changed_my_mind',
  'found_another_artist',
  'other',
] as const;

export const ARTIST_REJECT_REASONS = [
  'scheduling_conflict',
  'artistic_disagreement',
  'insufficient_details',
  'beyond_expertise',
  'other',
] as const;

export const SYSTEM_CANCEL_REASONS = [
  'not_attended',
  'system_timeout',
] as const;

export type QuotationCustomerCancelReason =
  (typeof CUSTOMER_CANCEL_REASONS)[number];
export type QuotationCustomerRejectReason =
  (typeof CUSTOMER_REJECT_REASONS)[number];
export type QuotationArtistRejectReason =
  (typeof ARTIST_REJECT_REASONS)[number];
export type QuotationSystemCancelReason =
  (typeof SYSTEM_CANCEL_REASONS)[number];
export type QuotationCancelBy = 'customer' | 'system';
export type QuotationRejectBy = 'customer' | 'artist';

export type QuotationStatus =
  | 'pending'
  | 'quoted'
  | 'accepted'
  | 'rejected'
  | 'appealed'
  | 'canceled';

export type QuotationAppealedReason =
  | 'dateChange'
  | 'priceChange'
  | 'designChange';

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
    enum: ['pending', 'quoted', 'accepted', 'rejected', 'appealed', 'canceled'],
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

  @Column({
    name: 'reject_by',
    nullable: true,
    enum: ['customer', 'artist'],
    enumName: 'quotation_reject_by',
  })
  rejectBy?: QuotationRejectBy;

  @Column({
    name: 'customer_reject_reason',
    nullable: true,
    enum: CUSTOMER_REJECT_REASONS,
    enumName: 'quotation_customer_reject_reason',
  })
  customerRejectReason?: QuotationCustomerRejectReason;

  @Column({
    name: 'artist_reject_reason',
    nullable: true,
    enum: ARTIST_REJECT_REASONS,
    enumName: 'quotation_artist_reject_reason',
  })
  artistRejectReason?: QuotationArtistRejectReason;

  @Column({ name: 'reject_reason_details', nullable: true, type: 'text' })
  rejectReasonDetails?: string;

  @Column({ name: 'rejected_date', nullable: true })
  rejectedDate?: Date;

  @Column({
    name: 'appealed_reason',
    nullable: true,
    enum: ['dateChange', 'priceChange', 'designChange'],
    enumName: 'quotation_appealed_reason',
  })
  appealedReason?: QuotationAppealedReason;

  @Column({ name: 'appealed_date', nullable: true })
  appealedDate?: Date;

  @Column({ name: 'canceled_by', nullable: true, enum: ['customer', 'system'] })
  canceledBy?: 'customer' | 'system';

  @Column({
    name: 'customer_cancel_reason',
    nullable: true,
    enum: CUSTOMER_CANCEL_REASONS,
    enumName: 'quotation_customer_cancel_reason',
  })
  customerCancelReason?: QuotationCustomerCancelReason;

  @Column({
    name: 'system_cancel_reason',
    nullable: true,
    enum: SYSTEM_CANCEL_REASONS,
    enumName: 'quotation_system_cancel_reason',
  })
  systemCancelReason?: QuotationSystemCancelReason;

  @Column({ name: 'cancel_reason_details', nullable: true, type: 'text' })
  cancelReasonDetails?: string;

  @Column({ name: 'canceled_date', nullable: true })
  canceledDate?: Date;

  @OneToMany(() => QuotationHistory, history => history.quotation)
  history?: QuotationHistory[];
}
