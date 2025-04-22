import { Column, Entity, Index, OneToMany } from 'typeorm';
import { ArtistMetricsViewer } from './artist-metrics-viewer.entity';
import { BaseEntity } from '../../../../global/infrastructure/entities/base.entity';
import { IArtistMetrics } from '../../../domain/interfaces/artist-metrics.interface';

@Entity()
export class ArtistMetrics extends BaseEntity implements IArtistMetrics {
  @Index("IDX_f96f80047970cd4d6cb8e9ddb0", { unique: true })
  @Column({ name: 'artist_id', type: 'uuid' })
  artistId: string;

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