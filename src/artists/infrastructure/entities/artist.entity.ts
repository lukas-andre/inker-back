import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Tag } from './tag.entity';
import { Gender } from './genders.entity';

@Entity()
export class Artist {
  @PrimaryGeneratedColumn()
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

  @ManyToMany(() => Tag)
  @JoinTable({ name: 'artist_tags' })
  tags: Tag[];

  @ManyToMany(() => Gender)
  @JoinTable({ name: 'artist_genders' })
  genders: Gender[];

  @Column({ type: 'float', default: 0.0 })
  rating: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
