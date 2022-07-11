import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { GenreInterface } from '../../../genres/genre.interface';
import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';
import { TagInterface } from '../../../tags/tag.interface';
import { Contact } from './contact.entity';

@Entity()
export class Artist extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'username' })
  username: string;

  @Column({ name: 'first_name', nullable: true })
  firstName: string;

  @Column({ name: 'last_name', nullable: true })
  lastName: string;

  @Column({ name: 'short_description', nullable: true })
  shortDescription: string;

  @Column({ name: 'profile_thumbnail', nullable: true })
  profileThumbnail: string;

  @OneToOne(() => Contact, contact => contact.artist, { cascade: true })
  @JoinColumn()
  contact: Contact;

  @Column('jsonb', { nullable: true })
  tags: TagInterface[];

  @Column('jsonb', { nullable: true })
  genres: GenreInterface[];

  @Column({ type: 'float', default: 0.0 })
  rating: number;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
