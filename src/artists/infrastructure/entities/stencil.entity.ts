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
import { StencilStatus, StencilType } from '../../domain/stencilType';

@Entity('stencils')
@Index(['status'])
@Index(['isHidden'])
@Index(['deletedAt'])
export class Stencil extends BaseEntity implements StencilType {
  @Column({ name: 'artist_id' })
  @Index()
  artistId: string;

  @ManyToOne(() => Artist, artist => artist.stencils)
  @JoinColumn({ name: 'artist_id' })
  artist: Artist;

  @Column({ name: 'title' })
  title: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'image_url' })
  imageUrl: string;

  @Column({ name: 'image_id', type: 'varchar', length: 40 })
  imageId: string;

  @Column({ name: 'image_version', default: 0 })
  imageVersion: number;

  @Column({ name: 'thumbnail_url', nullable: true })
  thumbnailUrl?: string;

  @Column({ name: 'thumbnail_version', default: 0 })
  thumbnailVersion: number;

  @Column({ name: 'is_featured', default: false })
  isFeatured: boolean;

  @Column({ name: 'order_position', default: 0 })
  orderPosition: number;

  @Column({ name: 'price', type: 'decimal', precision: 10, scale: 1, nullable: true })
  price?: number;

  @Column({
    name: 'status',
    type: 'enum',
    enum: StencilStatus,
    default: StencilStatus.AVAILABLE
  })
  status: StencilStatus;

  @Column({ name: 'is_hidden', default: false })
  isHidden: boolean;

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

  @Column({ type: 'tsvector', nullable: false, select: false })
  @Index()
  tsv: string;

  @Column({ name: 'dimensions', type: 'jsonb', nullable: true })
  dimensions?: { width: number; height: number };

  @Column({ name: 'recommended_placements', type: 'text', nullable: true, default: '[]' })
  recommendedPlacements?: string;

  @Column({ name: 'estimated_time', type: 'int', nullable: true })
  estimatedTime?: number;

  @Column({ name: 'is_customizable', type: 'boolean', nullable: true, default: false })
  isCustomizable?: boolean;

  @Column({ name: 'is_downloadable', type: 'boolean', nullable: true, default: false })
  isDownloadable?: boolean;

  @Column({ name: 'is_available', type: 'boolean', nullable: true, default: false })
  isAvailable?: boolean;

  @Column({ name: 'license', type: 'text', nullable: true })
  license?: string;

  @Column({ name: 'license_url', type: 'text', nullable: true })
  licenseUrl?: string;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}