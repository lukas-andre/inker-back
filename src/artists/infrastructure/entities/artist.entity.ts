import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToOne,
} from 'typeorm';

import { GenreInterface } from '../../../genres/genre.interface';
import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';
import { TagInterface } from '../../../tags/tag.interface';
import { ArtistType } from '../../domain/artistType';

import { Contact } from './contact.entity';
import { Service } from './service.entity';

@Entity()
export class Artist extends BaseEntity implements ArtistType {
  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'username' })
  username: string;

  @ManyToMany(() => Service, service => service.artists)
  @JoinTable()
  services: Service[];

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ name: 'short_description', nullable: true })
  shortDescription?: string;

  @Column({ name: 'profile_thumbnail', nullable: true })
  profileThumbnail?: string;

  @Column({ default: 0 })
  profileThumbnailVersion: number;

  @OneToOne(() => Contact, contact => contact.artist, { cascade: true })
  @JoinColumn({ name: 'contact_id' })
  contact: Contact;

  // TODO: This should be removed
  @Column({ type: 'float', default: 0.0 })
  rating: number;

  @Column({ name: 'studio_photo', nullable: true })
  studioPhoto?: string;

  @Column({ default: 0 })
  studioPhotoVersion: number;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
