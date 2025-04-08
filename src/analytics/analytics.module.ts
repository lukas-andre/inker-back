import { Module } from '@nestjs/common';
import { AnalyticsController } from './infrastructure/analytics.controller';
import { AnalyticsRepositoryModule } from './infrastructure/database/repositories/analyticsRepository.module';
import { RecordInteractionUseCase } from './usecases/recordInteraction.usecase';
import { RecordArtistViewUseCase } from './usecases/recordArtistView.usecase';
import { GetContentMetricsUseCase } from './usecases/getContentMetrics.usecase';
import { GetArtistMetricsUseCase } from './usecases/getArtistMetrics.usecase';
import { GetBatchContentMetricsUseCase } from './usecases/getBatchContentMetrics.usecase';
import { RecordArtistFollowUseCase } from './usecases/recordArtistFollow.usecase';
import { GetContentSummaryMetricsUseCase } from './usecases/getContentSummaryMetrics.usecase';
import { ContentMetricsEnricherService } from './infrastructure/services/content-metrics-enricher.service';

const useCases = [
  RecordInteractionUseCase,
  RecordArtistViewUseCase,
  GetContentMetricsUseCase,
  GetArtistMetricsUseCase,
  GetBatchContentMetricsUseCase,
  RecordArtistFollowUseCase,
  GetContentSummaryMetricsUseCase,
];

const services = [
  ContentMetricsEnricherService,
];

@Module({
  imports: [AnalyticsRepositoryModule],
  controllers: [AnalyticsController],
  providers: [...useCases, ...services],
  exports: [
    RecordInteractionUseCase,
    RecordArtistViewUseCase,
    RecordArtistFollowUseCase,
    GetContentSummaryMetricsUseCase,
    ContentMetricsEnricherService,
  ],
})
export class AnalyticsModule {} 