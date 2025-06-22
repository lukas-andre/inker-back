import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import { MoneyEntity } from '../../../global/domain/models/money.model';
import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';
import { MultimediasMetadataInterface } from '../../../multimedias/interfaces/multimediasMetadata.interface';

import { QuotationHistory } from './quotationHistory.entity';
import { QuotationOffer } from './quotationOffer.entity';

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

export enum QuotationStatus {
  PENDING = 'pending',
  QUOTED = 'quoted',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  APPEALED = 'appealed',
  CANCELED = 'canceled',
  OPEN = 'open',
}

export enum QuotationType {
  DIRECT = 'DIRECT',
  OPEN = 'OPEN',
}

@Entity({ name: 'quotation' })
@Index(['type', 'status']) // For filtering by type and status
@Index(['artistId', 'status', 'type']) // For artist-specific queries
@Index(['appointmentDate']) // For date range filtering
export class Quotation extends BaseEntity {
  @Index()
  @Column({ name: 'customer_id' })
  customerId: string;

  @Index()
  @Column({ name: 'artist_id', nullable: true })
  artistId?: string;

  @Index()
  @Column({
    type: 'enum',
    enum: QuotationType,
    default: QuotationType.DIRECT,
  })
  type: QuotationType;

  @Column({ name: 'customer_lat', type: 'float', nullable: true })
  customerLat?: number;

  @Column({ name: 'customer_lon', type: 'float', nullable: true })
  customerLon?: number;

  @Column({
    name: 'customer_travel_radius_km',
    type: 'integer',
    nullable: true,
  })
  customerTravelRadiusKm?: number;

  @Column()
  description: string;

  @Column({ name: 'reference_images', type: 'jsonb', nullable: true })
  referenceImages?: MultimediasMetadataInterface;

  @Column({ name: 'proposed_designs', type: 'jsonb', nullable: true })
  proposedDesigns?: MultimediasMetadataInterface;

  @Column({
    type: 'enum',
    name: 'status',
    enum: QuotationStatus,
    enumName: 'quotation_status',
    default: QuotationStatus.PENDING,
  })
  status: QuotationStatus;

  @Column({
    name: 'estimated_cost',
    type: 'jsonb',
    nullable: true,
    transformer: {
      to(value: MoneyEntity): any {
        if (!value) return null;
        return {
          amount: value.amount,
          currency: value.currency,
          scale: value.scale,
        };
      },
      from(value: any): MoneyEntity {
        if (!value) return null;
        return new MoneyEntity(value.amount, value.currency, value.scale);
      },
    },
  })
  estimatedCost?: MoneyEntity;

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
  lastUpdatedBy?: string;

  @Column({
    name: 'last_updated_by_user_type',
    type: 'enum',
    enum: ['customer', 'artist', 'admin', 'system'],
    enumName: 'quotation_user_type',
    nullable: true,
  })
  lastUpdatedByUserType?: QuotationUserType;

  @Column({
    name: 'read_by_artist',
    type: 'boolean',
    default: false,
  })
  readByArtist: boolean;

  @Column({
    name: 'read_by_customer',
    type: 'boolean',
    default: false,
  })
  readByCustomer: boolean;

  @Column({
    name: 'artist_read_at',
    type: 'timestamp',
    nullable: true,
  })
  artistReadAt?: Date;

  @Column({
    name: 'customer_read_at',
    type: 'timestamp',
    nullable: true,
  })
  customerReadAt?: Date;

  @Column({ name: 'stencil_id', nullable: true })
  stencilId?: string;

  @Index()
  @Column({ name: 'tattoo_design_cache_id', nullable: true })
  tattooDesignCacheId?: string;

  @Column({ name: 'tattoo_design_image_url', type: 'text', nullable: true })
  tattooDesignImageUrl?: string;

  @OneToMany(() => QuotationHistory, history => history.quotation)
  history?: QuotationHistory[];

  @OneToMany(() => QuotationOffer, offer => offer.quotation)
  offers?: QuotationOffer[];

  @Column({
    name: 'min_budget',
    type: 'jsonb',
    nullable: true,
    transformer: {
      to: (v: MoneyEntity) => (v ? v.toJSON() : null),
      from: (v: any) =>
        v ? new MoneyEntity(v.amount, v.currency, v.scale) : null,
    },
  })
  minBudget?: MoneyEntity;

  @Column({
    name: 'max_budget',
    type: 'jsonb',
    nullable: true,
    transformer: {
      to: (v: MoneyEntity) => (v ? v.toJSON() : null),
      from: (v: any) =>
        v ? new MoneyEntity(v.amount, v.currency, v.scale) : null,
    },
  })
  maxBudget?: MoneyEntity;

  @Column({
    name: 'reference_budget',
    type: 'jsonb',
    nullable: true,
    transformer: {
      to: (v: MoneyEntity) => (v ? v.toJSON() : null),
      from: (v: any) =>
        v ? new MoneyEntity(v.amount, v.currency, v.scale) : null,
    },
  })
  referenceBudget?: MoneyEntity;

  @Column({ name: 'generated_image_id', type: 'varchar', nullable: true })
  generatedImageId?: string;
}
