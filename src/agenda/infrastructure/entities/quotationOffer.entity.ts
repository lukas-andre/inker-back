import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { MoneyEntity } from '../../../global/domain/models/money.model';
import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';

import { Quotation } from './quotation.entity';
// import { User } from '../../../users/infrastructure/entities/user.entity'; // Not needed here
// import { Artist } from '../../../artists/infrastructure/entities/artist.entity'; // Remove cross-db entity import

export enum QuotationOfferStatus {
  SUBMITTED = 'SUBMITTED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
}

// Define the structure for a single chat message
export interface OfferMessage {
  senderId: string; // Could be customerId or artistId
  senderType: 'customer' | 'artist';
  message: string;
  imageUrl?: string; // Optional URL for an image
  timestamp: Date;
}

@Entity({ name: 'quotation_offers' })
@Index(['quotationId', 'artistId', 'estimatedDate']) // Composite index for scheduler queries
export class QuotationOffer extends BaseEntity {
  @Index()
  @Column({ name: 'quotation_id' })
  quotationId: string;

  @ManyToOne(() => Quotation, quotation => quotation.offers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'quotation_id' })
  quotation: Quotation;

  @Index()
  @Column({ name: 'artist_id' })
  artistId: string;

  // @ManyToOne(() => Artist, { onDelete: 'CASCADE' }) // Remove Artist relation
  // @JoinColumn({ name: 'artist_id' })
  // artist: Artist;

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

  @Column({ name: 'estimated_date', nullable: true })
  estimatedDate?: Date;

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

  @Column({ name: 'messages', type: 'jsonb', nullable: true, default: [] })
  messages?: OfferMessage[];
}
