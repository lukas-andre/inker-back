import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentMetrics } from '../entities/content-metrics.entity';
import { ArtistMetrics } from '../entities/artist-metrics.entity';
import { ContentMetricsViewer } from '../entities/content-metrics-viewer.entity';
import { ArtistMetricsViewer } from '../entities/artist-metrics-viewer.entity';
import { ANALYTICS_DB_CONNECTION_NAME } from '../../../../databases/constants';
import { AnalyticsRepository } from './analytics.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [ContentMetrics, ArtistMetrics, ContentMetricsViewer, ArtistMetricsViewer], 
      ANALYTICS_DB_CONNECTION_NAME
    ),
  ],
  providers: [AnalyticsRepository],
  exports: [AnalyticsRepository],
})
export class AnalyticsRepositoryModule {} 