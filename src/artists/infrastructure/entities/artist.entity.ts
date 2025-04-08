import {
  Column,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';
import { ArtistType } from '../../domain/artistType';
import { Service } from './service.entity';
import { Contact } from './contact.entity';
import { Work } from './work.entity';
import { Stencil } from './stencil.entity';
import { ArtistStyle } from './artistStyle.entity';
import { Tag } from '../../../tags/tag.entity';

@Entity()
@Index(['firstName', 'lastName', 'username'])
@Index(['rating'])
@Index(['deletedAt'])
export class Artist extends BaseEntity implements ArtistType {
  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({ name: 'username' })
  @Index()
  username: string;

  @ManyToMany(() => Service, service => service.artists)
  @JoinTable({
    name: 'artist_services',
    joinColumn: {
      name: 'artist_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'service_id',
      referencedColumnName: 'id',
    },
  })
  services: Service[];

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ name: 'short_description', nullable: true, type: 'text' })
  shortDescription?: string;

  @Column({ name: 'profile_thumbnail', nullable: true })
  profileThumbnail?: string;

  @Column({ default: 0 })
  profileThumbnailVersion: number;

  @OneToOne(() => Contact, contact => contact.artist, {
    cascade: true,
    eager: true,
  })
  @JoinColumn({
    name: 'contact_id',
    foreignKeyConstraintName: 'fk_artist_contact',
  })
  contact: Contact;

  @Column({
    type: 'decimal',
    precision: 3,
    scale: 1,
    default: 0.0,
    comment: 'Artist rating from 0.0 to 5.0',
  })
  rating: number;

  @Column({ name: 'studio_photo', nullable: true })
  studioPhoto?: string;

  @Column({ default: 0 })
  studioPhotoVersion: number;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @Column({ name: 'works_count', default: 0, comment: 'Count of all works (including hidden)' })
  worksCount: number;

  @Column({ name: 'stencils_count', default: 0, comment: 'Count of all stencils (including hidden)' })
  stencilsCount: number;

  @Column({ name: 'visible_works_count', default: 0, comment: 'Count of visible works only (is_hidden=false)' })
  visibleWorksCount: number;

  @Column({ name: 'visible_stencils_count', default: 0, comment: 'Count of visible stencils only (is_hidden=false)' })
  visibleStencilsCount: number;

  @OneToMany(() => Work, work => work.artist)
  works: Work[];

  @OneToMany(() => Stencil, stencil => stencil.artist)
  stencils: Stencil[];

  @OneToMany(() => ArtistStyle, artistStyle => artistStyle.artist)
  styles: ArtistStyle[];

  @ManyToMany(() => Tag, { eager: false })
  @JoinTable({
    name: 'artist_tags',
    joinColumn: {
      name: 'artist_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'tag_id',
      referencedColumnName: 'id',
    },
  })
  tags: Tag[];
}
