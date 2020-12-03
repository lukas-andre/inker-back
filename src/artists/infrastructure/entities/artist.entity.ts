import {
  Entity,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Tag } from './tag.entity';
import { Gender } from './genders.entity';
import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';

@Entity()
export class Artist extends BaseEntity {
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

  @ManyToMany(() => Tag)
  @JoinTable({ name: 'artist_tags' })
  tags: Tag[];

  @ManyToMany(() => Gender)
  @JoinTable({ name: 'artist_genders' })
  genders: Gender[];

  @Column({ type: 'float', default: 0.0 })
  rating: number;
}
