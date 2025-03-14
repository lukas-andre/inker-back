import {
  Column,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
} from 'typeorm';
import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';
import { Artist } from './artist.entity';
import { Tag } from '../../../tags/tag.entity';
import { StencilType } from '../../domain/stencilType';

@Entity('stencils')
@Index(['isAvailable'])
@Index(['deletedAt'])
export class Stencil extends BaseEntity implements StencilType {
  @Column({ name: 'artist_id' })
  @Index()
  artistId: number;

  @ManyToOne(() => Artist, artist => artist.stencils)
  @JoinColumn({ name: 'artist_id' })
  artist: Artist;

  @Column({ name: 'title' })
  title: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'image_url' })
  imageUrl: string;

  @Column({ name: 'image_version', default: 0 })
  imageVersion: number;

  @Column({ name: 'thumbnail_url', nullable: true })
  thumbnailUrl?: string;

  @Column({ name: 'thumbnail_version', default: 0 })
  thumbnailVersion: number;

  @Column({ name: 'price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  price?: number;

  @Column({ name: 'is_available', default: true })
  isAvailable: boolean;

  @ManyToMany(() => Tag, { eager: false })
  @JoinTable({
    name: 'stencil_tags',
    joinColumn: {
      name: 'stencil_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'tag_id',
      referencedColumnName: 'id',
    },
  })
  tags: Tag[];

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}