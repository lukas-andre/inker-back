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

export const CUSTOMER_APPEAL_REASONS = [
  'date_change',
  'price_change',
  'design_change',
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

export const QUOTATION_CANCELED_BY = ['customer', 'system'] as const;
export const QUOTATION_REJECTED_BY = ['customer', 'artist', 'system'] as const;
export const QUOTATION_USER_TYPE = [
  'customer',
  'artist',
  'admin',
  'system',
] as const;

export type QuotationCustomerCancelReason =
  (typeof CUSTOMER_CANCEL_REASONS)[number];
export type QuotationCustomerRejectReason =
  (typeof CUSTOMER_REJECT_REASONS)[number];
export type QuotationArtistRejectReason =
  (typeof ARTIST_REJECT_REASONS)[number];
export type QuotationSystemCancelReason =
  (typeof SYSTEM_CANCEL_REASONS)[number];
export type QuotationCustomerAppealReason =
  (typeof CUSTOMER_APPEAL_REASONS)[number];
export type QuotationCancelBy = (typeof QUOTATION_CANCELED_BY)[number];
export type QuotationRejectBy = (typeof QUOTATION_REJECTED_BY)[number];

export type QuotationUserType = (typeof QUOTATION_USER_TYPE)[number];

export type QuotationStatus =
  | 'pending'
  | 'quoted'
  | 'accepted'
  | 'rejected'
  | 'appealed'
  | 'canceled';

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
    type: 'enum',
    name: 'status',
    enum: ['pending', 'quoted', 'accepted', 'rejected', 'appealed', 'canceled'],
    enumName: 'quotation_status',
    default: 'pending',
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
    type: 'enum',
    name: 'reject_by',
    nullable: true,
    enum: QUOTATION_REJECTED_BY,
    enumName: 'quotation_reject_by',
  })
  rejectBy?: QuotationRejectBy;

  @Column({
    type: 'enum',
    name: 'customer_reject_reason',
    nullable: true,
    enum: CUSTOMER_REJECT_REASONS,
    enumName: 'quotation_customer_reject_reason',
  })
  customerRejectReason?: QuotationCustomerRejectReason;

  @Column({
    type: 'enum',
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
    type: 'enum',
    name: 'appealed_reason',
    nullable: true,
    enum: CUSTOMER_APPEAL_REASONS,
    enumName: 'quotation_appealed_reason',
  })
  appealedReason?: QuotationCustomerAppealReason;

  @Column({ name: 'appealed_date', nullable: true })
  appealedDate?: Date;

  @Column({
    type: 'enum',
    name: 'canceled_by',
    nullable: true,
    enum: QUOTATION_CANCELED_BY,
    enumName: 'quotation_canceled_by',
  })
  canceledBy?: QuotationCancelBy;

  @Column({
    type: 'enum',
    name: 'customer_cancel_reason',
    nullable: true,
    enum: CUSTOMER_CANCEL_REASONS,
    enumName: 'quotation_customer_cancel_reason',
  })
  customerCancelReason?: QuotationCustomerCancelReason;

  @Column({
    type: 'enum',
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

  @Column({
    name: 'last_updated_by',
    nullable: true,
    comment: 'User ID of the last person who updated the quotation',
  })
  lastUpdatedBy?: number;

  @Column({
    name: 'last_updated_by_user_type',
    type: 'enum',
    enum: ['customer', 'artist', 'admin', 'system'],
    enumName: 'quotation_user_type',
    nullable: true,
  })
  lastUpdatedByUserType?: QuotationUserType;

  @OneToMany(() => QuotationHistory, history => history.quotation)
  history?: QuotationHistory[];
}
