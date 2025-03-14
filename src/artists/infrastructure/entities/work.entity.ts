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
import { WorkSource, WorkType } from '../../domain/workType';

@Entity('works')
@Index(['isFeatured'])
@Index(['deletedAt'])
@Index(['source'])
export class Work extends BaseEntity implements WorkType {
  @Column({ name: 'artist_id' })
  @Index()
  artistId: number;

  @ManyToOne(() => Artist, artist => artist.works)
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

  @Column({ name: 'is_featured', default: false })
  isFeatured: boolean;

  @Column({ name: 'order_position', default: 0 })
  orderPosition: number;

  @Column({ 
    name: 'source', 
    type: 'enum', 
    enum: WorkSource, 
    default: WorkSource.EXTERNAL 
  })
  source: WorkSource;

  @ManyToMany(() => Tag, { eager: false })
  @JoinTable({
    name: 'work_tags',
    joinColumn: {
      name: 'work_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'tag_id',
      referencedColumnName: 'id',
    },
  })
  tags: Tag[];

  @Column({ type: 'tsvector', nullable: false, select: false })
  tsv: string;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}