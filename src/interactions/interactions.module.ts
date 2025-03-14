import { Module } from '@nestjs/common';
import { InteractionsController } from './infrastructure/interactions.controller';
import { InteractionsHandler } from './infrastructure/interactions.handler';
import { InteractionProviderModule } from './infrastructure/database/interactionProvider.module';
import { CreateInteractionUseCase } from './usecases/createInteraction.usecase';
import { GetUserInteractionsUseCase } from './usecases/getUserInteractions.usecase';
import { DeleteInteractionUseCase } from './usecases/deleteInteraction.usecase';
import { GetTrendingContentUseCase } from './usecases/getTrendingContent.usecase';

const useCases = [
  CreateInteractionUseCase,
  GetUserInteractionsUseCase,
  DeleteInteractionUseCase,
  GetTrendingContentUseCase,
];

@Module({
  imports: [InteractionProviderModule],
  controllers: [InteractionsController],
  providers: [InteractionsHandler, ...useCases],
  exports: [InteractionsHandler],
})
export class InteractionsModule {}