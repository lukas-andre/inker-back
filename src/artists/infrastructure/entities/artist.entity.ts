import { GenrerInterface } from '../../../genres/genre.interface';
import { TagInterface } from '../../../tags/tag.interface';
import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';

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

  @Column({ name: 'contact_email', nullable: true })
  contactEmail: string;

  @Column({ name: 'contact_phone_number', nullable: true })
  contactPhoneNumber: string;

  @Column({ name: 'short_description', nullable: true })
  shortDescription: string;

  @Column({ name: 'profile_thumbnail', nullable: true })
  profileThumbnail: string;

  @Column('jsonb', { nullable: true })
  tags: TagInterface[];

  @Column('jsonb', { nullable: true })
  genres: GenrerInterface[];

  @Column({ type: 'float', default: 0.0 })
  rating: number;
}
