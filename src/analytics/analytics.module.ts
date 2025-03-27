import { Module } from '@nestjs/common';
import { AnalyticsController } from './infrastructure/analytics.controller';
import { AnalyticsProviderModule } from './infrastructure/database/analyticsProvider.module';
import { RecordInteractionUseCase } from './usecases/recordInteraction.usecase';
import { RecordArtistViewUseCase } from './usecases/recordArtistView.usecase';
import { GetContentMetricsUseCase } from './usecases/getContentMetrics.usecase';
import { GetArtistMetricsUseCase } from './usecases/getArtistMetrics.usecase';
import { GetBatchContentMetricsUseCase } from './usecases/getBatchContentMetrics.usecase';
import { RecordArtistFollowUseCase } from './usecases/recordArtistFollow.usecase';
import { GetContentSummaryMetricsUseCase } from './usecases/getContentSummaryMetrics.usecase';

const useCases = [
  RecordInteractionUseCase,
  RecordArtistViewUseCase,
  GetContentMetricsUseCase,
  GetArtistMetricsUseCase,
  GetBatchContentMetricsUseCase,
  RecordArtistFollowUseCase,
  GetContentSummaryMetricsUseCase,
];

@Module({
  imports: [AnalyticsProviderModule],
  controllers: [AnalyticsController],
  providers: [...useCases],
  exports: [
    RecordInteractionUseCase,
    RecordArtistViewUseCase,
    RecordArtistFollowUseCase,
    GetContentSummaryMetricsUseCase,
  ],
})
export class AnalyticsModule {} 