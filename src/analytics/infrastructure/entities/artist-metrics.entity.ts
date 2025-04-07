import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';
import { IArtistMetrics } from '../../domain/interfaces/artist-metrics.interface';
import { ArtistMetricsViewer } from './artist-metrics-viewer.entity';

@Entity('artist_metrics')
@Index(['artistId'], { unique: true })
export class ArtistMetrics extends BaseEntity implements IArtistMetrics {
  @Column({ name: 'artist_id' })
  artistId: number;

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
    views: {
      count: number;
      uniqueCount: number;
    };
    followers?: {
      count: number;
      fromContentViews?: number;
      conversionRate?: number;
    };
  };

  @OneToMany(() => ArtistMetricsViewer, viewer => viewer.metrics)
  viewers: ArtistMetricsViewer[];
} 