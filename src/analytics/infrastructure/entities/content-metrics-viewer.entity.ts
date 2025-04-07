import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ContentMetrics } from './content-metrics.entity';

@Entity('content_metrics_viewers')
@Index(['metricsId', 'viewerKey'], { unique: true })
export class ContentMetricsViewer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'metrics_id' })
  metricsId: number;

  @Column({ name: 'viewer_key', length: 100 })
  viewerKey: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => ContentMetrics, metrics => metrics.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'metrics_id' })
  metrics: ContentMetrics;
} 