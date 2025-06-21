import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tattoo_design_cache')
export class TattooDesignCacheEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  userQuery: string;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Tattoo style from TattooStyle enum',
  })
  style: string;

  @Column({ type: 'text', array: true })
  imageUrls: string[];

  @Column({ type: 'text', nullable: true })
  prompt: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'tsvector', nullable: true })
  @Index({ fulltext: true })
  searchVector: string;

  @Column({ type: 'int', default: 1 })
  usageCount: number;

  @Column({ type: 'boolean', default: false })
  isFavorite: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
