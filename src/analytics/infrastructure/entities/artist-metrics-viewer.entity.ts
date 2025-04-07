import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ArtistMetrics } from './artist-metrics.entity';

@Entity('artist_metrics_viewers')
@Index(['metricsId', 'viewerKey'], { unique: true })
export class ArtistMetricsViewer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'metrics_id' })
  metricsId: number;

  @Column({ name: 'viewer_key', length: 100 })
  viewerKey: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => ArtistMetrics, metrics => metrics.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'metrics_id' })
  metrics: ArtistMetrics;
} 