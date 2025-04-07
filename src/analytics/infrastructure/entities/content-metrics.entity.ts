import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';
import { ContentType } from '../../domain/enums/content-types.enum';
import { IContentMetrics } from '../../domain/interfaces/content-metrics.interface';
import { ContentMetricsViewer } from './content-metrics-viewer.entity';

@Entity('content_metrics')
@Index(['contentId', 'contentType'], { unique: true })
export class ContentMetrics extends BaseEntity implements IContentMetrics {
  @Column({ name: 'content_id' })
  contentId: number;

  @Column({ 
    name: 'content_type',
    type: 'enum',
    enum: ContentType
  })
  contentType: ContentType;

  @Column({
    name: 'metrics',
    type: 'jsonb',
    default: {
      views: {
        count: 0,
        uniqueCount: 0
      }
    }
  })
  metrics: {
    reactions?: {
      like: {
        count: number;
        userIds: number[];
      };
    };
    views: {
      count: number;
      uniqueCount: number;
    };
    viewDuration?: {
      totalSeconds: number;
      averageSeconds: number;
    };
    engagementRate?: number;
    conversions?: {
      count: number;
      conversionRate: number;
    };
    impressions?: {
      count: number;
      ctr: number;
    };
    viewSources?: {
      search?: number;
      feed?: number;
      profile?: number;
      related?: number;
      direct?: number;
    };
  };

  @OneToMany(() => ContentMetricsViewer, viewer => viewer.metrics)
  viewers: ContentMetricsViewer[];
} 