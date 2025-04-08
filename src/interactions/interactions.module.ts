import { Module } from '@nestjs/common';
import { InteractionsController } from './infrastructure/interactions.controller';
import { InteractionsHandler } from './infrastructure/interactions.handler';
import { InteractionProviderModule } from './infrastructure/database/repositories/interactionRepository.module';
import { CreateInteractionUseCase } from './usecases/createInteraction.usecase';
import { GetUserInteractionsUseCase } from './usecases/getUserInteractions.usecase';
import { DeleteInteractionUseCase } from './usecases/deleteInteraction.usecase';
import { GetTrendingContentUseCase } from './usecases/getTrendingContent.usecase';
import { RecordAnalyticsUseCase } from './usecases/recordAnalytics.usecase';
import { AnalyticsModule } from '../analytics/analytics.module';

const useCases = [
  CreateInteractionUseCase,
  GetUserInteractionsUseCase,
  DeleteInteractionUseCase,
  GetTrendingContentUseCase,
  RecordAnalyticsUseCase,
];

@Module({
  imports: [InteractionProviderModule, AnalyticsModule],
  controllers: [InteractionsController],
  providers: [InteractionsHandler, ...useCases],
  exports: [InteractionsHandler],
})
export class InteractionsModule {}