import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';

import { Quotation } from './quotation.entity';

export type QuotationRole = 'customer' | 'artist';

@Entity()
export class QuotationHistory extends BaseEntity {
  @ManyToOne(() => Quotation, event => event.history)
  @JoinColumn({ name: 'quotation_id' })
  quotation: Quotation;

  @Column()
  status: string;

  @Column({ name: 'changed_at', default: () => 'CURRENT_TIMESTAMP' })
  changedAt: Date;

  @Column({ name: 'changed_by' })
  changedBy: number;

  @Column({ name: 'changed_by_user_type' })
  changedByUserType: QuotationRole;
}
