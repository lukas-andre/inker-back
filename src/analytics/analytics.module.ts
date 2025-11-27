import { Module } from '@nestjs/common';

import { AnalyticsController } from './infrastructure/analytics.controller';
import { AnalyticsRepositoryModule } from './infrastructure/database/repositories/analyticsRepository.module';
import { ContentMetricsEnricherService } from './infrastructure/services/content-metrics-enricher.service';
import { GetArtistMetricsUseCase } from './usecases/getArtistMetrics.usecase';
import { GetBatchContentMetricsUseCase } from './usecases/getBatchContentMetrics.usecase';
import { GetContentMetricsUseCase } from './usecases/getContentMetrics.usecase';
import { GetContentSummaryMetricsUseCase } from './usecases/getContentSummaryMetrics.usecase';
import { RecordArtistFollowUseCase } from './usecases/recordArtistFollow.usecase';
import { RecordArtistViewUseCase } from './usecases/recordArtistView.usecase';
import { RecordInteractionUseCase } from './usecases/recordInteraction.usecase';

const useCases = [
  RecordInteractionUseCase,
  RecordArtistViewUseCase,
  GetContentMetricsUseCase,
  GetArtistMetricsUseCase,
  GetBatchContentMetricsUseCase,
  RecordArtistFollowUseCase,
  GetContentSummaryMetricsUseCase,
];

const services = [ContentMetricsEnricherService];

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
