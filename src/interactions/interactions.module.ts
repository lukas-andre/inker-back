import { Module } from '@nestjs/common';

import { AnalyticsModule } from '../analytics/analytics.module';

import { InteractionProviderModule } from './infrastructure/database/repositories/interactionRepository.module';
import { InteractionsController } from './infrastructure/interactions.controller';
import { InteractionsHandler } from './infrastructure/interactions.handler';
import { CreateInteractionUseCase } from './usecases/createInteraction.usecase';
import { DeleteInteractionUseCase } from './usecases/deleteInteraction.usecase';
import { GetTrendingContentUseCase } from './usecases/getTrendingContent.usecase';
import { GetUserInteractionsUseCase } from './usecases/getUserInteractions.usecase';
import { RecordAnalyticsUseCase } from './usecases/recordAnalytics.usecase';

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
