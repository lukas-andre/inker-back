import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';
import { MoneyEntity } from '../../../global/domain/models/money.model';
import { Quotation } from './quotation.entity';

export enum QuotationOfferStatus {
  SUBMITTED = 'SUBMITTED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
}

@Entity({ name: 'quotation_offers' })
export class QuotationOffer extends BaseEntity {
  @Index()
  @Column({ name: 'quotation_id' })
  quotationId: string;

  @ManyToOne(() => Quotation, quotation => quotation.offers)
  quotation: Quotation;

  @Index()
  @Column({ name: 'artist_id' })
  artistId: string;

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

  // in minutes
  @Column({ name: 'estimated_duration', nullable: true })
  estimatedDuration?: number;

  @Column({ type: 'text', nullable: true })
  message?: string;

  @Column({
    type: 'enum',
    enum: QuotationOfferStatus,
    default: QuotationOfferStatus.SUBMITTED,
  })
  status: QuotationOfferStatus;
} 