import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ANALYTICS_DB_CONNECTION_NAME } from '../../../../databases/constants';
import { ArtistMetricsViewer } from '../entities/artist-metrics-viewer.entity';
import { ArtistMetrics } from '../entities/artist-metrics.entity';
import { ContentMetricsViewer } from '../entities/content-metrics-viewer.entity';
import { ContentMetrics } from '../entities/content-metrics.entity';

import { AnalyticsRepository } from './analytics.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [
        ContentMetrics,
        ArtistMetrics,
        ContentMetricsViewer,
        ArtistMetricsViewer,
      ],
      ANALYTICS_DB_CONNECTION_NAME,
    ),
  ],
  providers: [AnalyticsRepository],
  exports: [AnalyticsRepository],
})
export class AnalyticsRepositoryModule {}
