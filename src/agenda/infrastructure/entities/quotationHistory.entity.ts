import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';
import { MoneyEntity } from '../../../global/domain/models/money.model';
import {
  Quotation,
  QuotationCustomerAppealReason,
  QuotationStatus,
  QuotationUserType,
} from './quotation.entity';

export type QuotationRole = 'customer' | 'artist' | 'system';

@Entity()
export class QuotationHistory extends BaseEntity {
  @ManyToOne(() => Quotation, quotation => quotation.history)
  @JoinColumn({ name: 'quotation_id' })
  quotation: Quotation;

  @Column({
    name: 'previous_status',
    enum: ['pending', 'quoted', 'accepted', 'rejected', 'appealed', 'canceled'],
    enumName: 'quotation_status',
  })
  previousStatus: QuotationStatus;

  @Column({
    name: 'new_status',
    enum: ['pending', 'quoted', 'accepted', 'rejected', 'appealed', 'canceled'],
    enumName: 'quotation_status',
  })
  newStatus: QuotationStatus;

  @Column({ name: 'changed_at', default: () => 'CURRENT_TIMESTAMP' })
  changedAt: Date;

  @Column({ name: 'changed_by' })
  changedBy: number;

  @Column({
    name: 'changed_by_user_type',
    enum: ['customer', 'artist', 'system'],
  })
  changedByUserType: QuotationRole;

  @Column({
    name: 'previous_estimated_cost',
    type: 'jsonb',
    nullable: true,
    transformer: {
      to(value: MoneyEntity): any {
        if (!value) return null;
        return value.toJSON();
      },
      from(value: any): MoneyEntity {
        return value ? MoneyEntity.fromJson(value) : null;
      }
    }
  })
  previousEstimatedCost?: MoneyEntity;

  @Column({
    name: 'new_estimated_cost',
    type: 'jsonb',
    nullable: true,
    transformer: {
      to(value: MoneyEntity): any {
        if (!value) return null;
        return value.toJSON();
      },
      from(value: any): MoneyEntity {
        return value ? MoneyEntity.fromJson(value) : null;
      }
    }
  })
  newEstimatedCost?: MoneyEntity;

  @Column({ name: 'previous_appointment_date', nullable: true })
  previousAppointmentDate?: Date;

  @Column({ name: 'new_appointment_date', nullable: true })
  newAppointmentDate?: Date;

  @Column({ name: 'previous_appointment_duration', nullable: true })
  previousAppointmentDuration?: number;

  @Column({ name: 'new_appointment_duration', nullable: true })
  newAppointmentDuration?: number;

  @Column({
    name: 'appealed_reason',
    nullable: true,
    enum: ['dateChange', 'priceChange', 'designChange'],
    enumName: 'quotation_appealed_reason',
  })
  appealedReason?: QuotationCustomerAppealReason;

  @Column({ name: 'rejection_reason', nullable: true, type: 'text' })
  rejectionReason?: string;

  @Column({ name: 'cancellation_reason', nullable: true, type: 'text' })
  cancellationReason?: string;

  @Column({ name: 'additional_details', nullable: true, type: 'text' })
  additionalDetails?: string;

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
}