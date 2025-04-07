import { Column, DeleteDateColumn, Entity, Index } from 'typeorm';

import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';
import { CustomerFollows } from '../../domain/interfaces/customerFollows.interface';

@Entity()
export class Customer extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'first_name', nullable: true })
  firstName: string;

  @Column({ name: 'last_name', nullable: true })
  lastName: string;

  @Column({ name: 'contact_email', nullable: true })
  contactEmail: string;

  @Column({ name: 'contact_phone_number', nullable: true })
  contactPhoneNumber: string;

  @Column({ name: 'short_description', nullable: true })
  shortDescription: string;

  @Column({ name: 'profile_thumbnail', nullable: true })
  profileThumbnail: string;

  @Column({ type: 'jsonb', nullable: true })
  follows: CustomerFollows[];

  @Column({ type: 'float', default: 0.0 })
  rating: number;

  // This doesn't have index because it's already indexed in the database! it's a tsvector column
  // and it's important to check if it's already indexed in the database before adding an index here
  // if it's already indexed in the database, it will throw an error
  // check fulltextsearch_customer.sql file in the migrations folder for more information
  @Column({ type: 'tsvector', nullable: false })
  tsv: string;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
