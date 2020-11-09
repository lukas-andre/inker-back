import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
} from 'typeorm';
import { Follower } from '../interfaces/follower.interface';
import { CustomerFollows } from '../../customers/interfaces/customerFollows.interface';

@Entity()
export class Artist {
  @PrimaryColumn({ generated: 'uuid' })
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

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
  // TODO: Considerar cambiar a una inferfaz globar Follow[] y listo.
  follows: CustomerFollows[];

  @Column({ type: 'jsonb', nullable: true })
  followers: Follower[];

  @Column({ type: 'float', default: 0.0 })
  rating: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
